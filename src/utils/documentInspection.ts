export type DocumentInspection = {
  name: string;
  type: string;
  size: number;
  status: "ready" | "warning" | "invalid";
  message: string;
  dimensions?: { width: number; height: number };
  qualityNotes?: string[];
  encrypted?: boolean;
};

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const maximumBytes = 5 * 1024 * 1024;

const analyseImage = (file: File, locale: "en" | "hi"): Promise<{ dimensions: { width: number; height: number }; notes: string[] }> => new Promise((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  image.onload = () => {
    const dimensions = { width: image.naturalWidth, height: image.naturalHeight };
    const canvas = document.createElement("canvas");
    const size = 160;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context?.drawImage(image, 0, 0, size, size);
    const pixels = context?.getImageData(0, 0, size, size).data;
    const notes: string[] = [];
    if (pixels) {
      const luminance: number[] = [];
      let veryDark = 0;
      let veryBright = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        const value = pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114;
        luminance.push(value);
        if (value < 18) veryDark += 1;
        if (value > 245) veryBright += 1;
      }
      const average = luminance.reduce((total, value) => total + value, 0) / luminance.length;
      const deviation = Math.sqrt(luminance.reduce((total, value) => total + (value - average) ** 2, 0) / luminance.length);
      let edgeDifference = 0;
      for (let row = 1; row < size; row += 1) for (let column = 1; column < size; column += 1) {
        const index = row * size + column;
        edgeDifference += Math.abs(luminance[index] - luminance[index - 1]) + Math.abs(luminance[index] - luminance[index - size]);
      }
      const sharpness = edgeDifference / ((size - 1) ** 2 * 2);
      if (average < 55) notes.push(locale === "en" ? "Image may be too dark." : "चित्र बहुत गहरा हो सकता है।");
      if (average > 225 || veryBright / luminance.length > 0.72) notes.push(locale === "en" ? "Image may be overexposed or affected by glare." : "चित्र बहुत उजला या चमक से प्रभावित हो सकता है।");
      if (deviation < 24) notes.push(locale === "en" ? "Low contrast may make text difficult to read." : "कम कंट्रास्ट से टेक्स्ट पढ़ना कठिन हो सकता है।");
      if (sharpness < 5.5) notes.push(locale === "en" ? "Image may be blurred; check small text carefully." : "चित्र धुंधला हो सकता है; छोटे टेक्स्ट को ध्यान से जाँचें।");
      if (veryDark / luminance.length > 0.28) notes.push(locale === "en" ? "Large dark areas detected; check for cropping or unintended masking." : "बड़े गहरे क्षेत्र मिले; कटाव या अनचाहे छिपाव की जाँच करें।");
    }
    resolve({ dimensions, notes });
    URL.revokeObjectURL(objectUrl);
  };
  image.onerror = () => {
    reject(new Error("The image could not be read."));
    URL.revokeObjectURL(objectUrl);
  };
  image.src = objectUrl;
});

export async function inspectDocument(file: File, locale: "en" | "hi"): Promise<DocumentInspection> {
  const text = locale === "en" ? {
    unsupported: "Use a PDF, JPG, or PNG file.",
    tooLarge: "File exceeds the 5 MB preparation limit.",
    unreadable: "The image could not be read; choose a clearer file.",
    lowResolution: "Image is readable but below 600 × 600 pixels; the official portal may reject unclear scans.",
    ready: "File type, size, and basic readability checks passed locally.",
    qualityWarning: "Local quality checks found items to review. This does not verify authenticity.",
    encrypted: "This PDF appears password-protected or encrypted; the official portal may not be able to read it.",
  } : {
    unsupported: "PDF, JPG या PNG फ़ाइल उपयोग करें।",
    tooLarge: "फ़ाइल 5 MB की तैयारी सीमा से बड़ी है।",
    unreadable: "चित्र पढ़ा नहीं जा सका; अधिक स्पष्ट फ़ाइल चुनें।",
    lowResolution: "चित्र पढ़ने योग्य है लेकिन 600 × 600 पिक्सेल से छोटा है; आधिकारिक पोर्टल अस्पष्ट स्कैन अस्वीकार कर सकता है।",
    ready: "फ़ाइल प्रकार, आकार और मूल पठनीयता जाँच स्थानीय रूप से सफल हुई।",
    qualityWarning: "स्थानीय गुणवत्ता जाँच में समीक्षा योग्य बातें मिलीं। यह प्रामाणिकता सत्यापित नहीं करता।",
    encrypted: "यह PDF पासवर्ड-सुरक्षित या एन्क्रिप्टेड लगता है; आधिकारिक पोर्टल इसे पढ़ न पाए।",
  };

  if (!allowedTypes.has(file.type)) return { name: file.name, type: file.type || "unknown", size: file.size, status: "invalid", message: text.unsupported };
  if (file.size > maximumBytes) return { name: file.name, type: file.type, size: file.size, status: "invalid", message: text.tooLarge };

  if (file.type.startsWith("image/")) {
    try {
      const { dimensions, notes } = await analyseImage(file, locale);
      if (dimensions.width < 600 || dimensions.height < 600) return { name: file.name, type: file.type, size: file.size, dimensions, status: "warning", message: text.lowResolution };
      if (notes.length) return { name: file.name, type: file.type, size: file.size, dimensions, qualityNotes: notes, status: "warning", message: text.qualityWarning };
      return { name: file.name, type: file.type, size: file.size, dimensions, status: "ready", message: text.ready };
    } catch {
      return { name: file.name, type: file.type, size: file.size, status: "invalid", message: text.unreadable };
    }
  }

  const header = new TextDecoder("latin1").decode(await file.slice(0, Math.min(file.size, 1024 * 1024)).arrayBuffer());
  if (/\/Encrypt\b/.test(header)) return { name: file.name, type: file.type, size: file.size, encrypted: true, status: "warning", message: text.encrypted };
  return { name: file.name, type: file.type, size: file.size, status: "ready", message: text.ready };
}
