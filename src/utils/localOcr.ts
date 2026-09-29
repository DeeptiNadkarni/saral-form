export type LocalOcrResult = {
  text: string;
  confidence: number;
  matchedFields: string[];
};

const normalize = (value: string) => value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

const MAX_PDF_PAGES = 10;

async function renderPdfPages(file: File): Promise<HTMLCanvasElement[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const canvases: HTMLCanvasElement[] = [];

  for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, MAX_PDF_PAGES); pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to prepare this PDF for OCR.");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    canvases.push(canvas);
  }

  return canvases;
}

export async function runLocalOcr(
  file: File,
  locale: "en" | "hi",
  values: Record<string, string>,
  onProgress: (progress: number) => void,
): Promise<LocalOcrResult> {
  const isPdf = file.type === "application/pdf" || file.name.toLocaleLowerCase().endsWith(".pdf");
  if (!file.type.startsWith("image/") && !isPdf) throw new Error(locale === "en" ? "Local OCR supports PDF, JPG, and PNG files." : "स्थानीय OCR PDF, JPG और PNG फ़ाइलों का समर्थन करता है।");
  const { createWorker } = await import("tesseract.js");
  const sources: Array<File | HTMLCanvasElement> = isPdf ? await renderPdfPages(file) : [file];
  let activeSourceIndex = 0;
  const worker = await createWorker(locale === "hi" ? ["eng", "hin"] : "eng", undefined, {
    logger: (message) => {
      if (message.status === "recognizing text") onProgress(Math.round((activeSourceIndex + message.progress) / sources.length * 100));
    },
  });
  try {
    const texts: string[] = [];
    const confidences: number[] = [];
    for (const [index, source] of sources.entries()) {
      activeSourceIndex = index;
      const result = await worker.recognize(source);
      texts.push(isPdf ? `--- Page ${index + 1} ---\n${result.data.text.trim()}` : result.data.text.trim());
      confidences.push(result.data.confidence);
      onProgress(Math.round((index + 1) / sources.length * 100));
    }
    const text = texts.join("\n\n");
    const normalizedText = normalize(text);
    const matchedFields = Object.entries(values)
      .filter(([, value]) => normalize(value).length >= 4 && normalizedText.includes(normalize(value)))
      .map(([fieldId]) => fieldId);
    const confidence = confidences.length ? Math.round(confidences.reduce((sum, value) => sum + value, 0) / confidences.length) : 0;
    return { text, confidence, matchedFields };
  } finally {
    await worker.terminate();
  }
}
