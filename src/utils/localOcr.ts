export type LocalOcrResult = {
  text: string;
  confidence: number;
  matchedFields: string[];
};

const normalize = (value: string) => value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export async function runLocalOcr(
  file: File,
  locale: "en" | "hi",
  values: Record<string, string>,
  onProgress: (progress: number) => void,
): Promise<LocalOcrResult> {
  if (!file.type.startsWith("image/")) throw new Error(locale === "en" ? "Local OCR currently supports JPG and PNG images." : "स्थानीय OCR अभी JPG और PNG चित्रों का समर्थन करता है।");
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(locale === "hi" ? ["eng", "hin"] : "eng", undefined, {
    logger: (message) => {
      if (message.status === "recognizing text") onProgress(Math.round(message.progress * 100));
    },
  });
  try {
    const result = await worker.recognize(file);
    const normalizedText = normalize(result.data.text);
    const matchedFields = Object.entries(values)
      .filter(([, value]) => normalize(value).length >= 4 && normalizedText.includes(normalize(value)))
      .map(([fieldId]) => fieldId);
    return { text: result.data.text.trim(), confidence: Math.round(result.data.confidence), matchedFields };
  } finally {
    await worker.terminate();
  }
}
