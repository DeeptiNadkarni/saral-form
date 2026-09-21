import { jsPDF } from "jspdf";
import { toDataURL } from "qrcode";
import { eligibilityEnhancements, getFieldEnhancement, serviceEnhancements } from "@/data/enhancements";
import type { DocumentGuide, FieldGuide, FormDefinition, Locale } from "@/data/forms";
import type { ConsistencyIssue, EligibilityQuestion, ServiceInstructions } from "@/data/readiness";
import type { DocumentInspection } from "@/utils/documentInspection";

type SummaryInput = {
  locale: Locale;
  serviceId: string;
  form: FormDefinition;
  fields: FieldGuide[];
  values: Record<string, string>;
  documents: DocumentGuide[];
  completedDocs: string[];
  inspections: Record<string, DocumentInspection>;
  eligibility: EligibilityQuestion[];
  eligibilityAnswers: Record<string, boolean | undefined>;
  issues: ConsistencyIssue[];
  instructions: ServiceInstructions;
  redactionMode: RedactionMode;
  includeQr: boolean;
};

export type RedactionMode = "none" | "sensitive" | "personal";

const redact = (value: string) => {
  if (!value) return "-";
  const visible = value.replace(/\s/g, "").slice(-4);
  return `${"•".repeat(Math.max(4, Math.min(12, value.length - visible.length)))}${visible}`;
};

const loadFont = async () => {
  const response = await fetch("/fonts/NotoSansDevanagari-Regular.ttf");
  if (!response.ok) throw new Error("Summary font could not be loaded.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  return btoa(binary);
};

export async function downloadPreparationSummary(input: SummaryInput) {
  const { locale, form } = input;
  const fontName = locale === "hi" ? "NotoSansDevanagari" : "helvetica";
  const labels = locale === "en" ? {
    title: "Application preparation summary",
    generated: "Generated locally",
    eligibility: "Eligibility pre-check",
    answers: "Prepared answers",
    documents: "Document readiness",
    instructions: "Official application guidance",
    warnings: "Consistency checks",
    unresolved: "Unresolved preparation warnings",
    sourceDate: "Official sources checked",
    qr: "Official portal QR",
    fee: "Fee",
    timing: "Processing",
    submission: "Submission",
    deadline: "Deadline",
    yes: "Yes",
    no: "No",
    unanswered: "Not answered",
    checked: "Checklist marked ready",
    unchecked: "Not marked ready",
    noIssues: "No consistency warnings detected.",
    privacy: "Privacy: generated in this browser. Document files are not included or uploaded. Verify current rules on the official portal.",
  } : {
    title: "आवेदन तैयारी सारांश",
    generated: "स्थानीय रूप से बनाया गया",
    eligibility: "पात्रता पूर्व-जाँच",
    answers: "तैयार उत्तर",
    documents: "दस्तावेज़ तैयारी",
    instructions: "आधिकारिक आवेदन मार्गदर्शन",
    warnings: "संगति जाँच",
    unresolved: "अनसुलझी तैयारी चेतावनियाँ",
    sourceDate: "आधिकारिक स्रोत जाँच तिथि",
    qr: "आधिकारिक पोर्टल QR",
    fee: "शुल्क",
    timing: "प्रसंस्करण",
    submission: "जमा करने का तरीका",
    deadline: "अंतिम तिथि",
    yes: "हाँ",
    no: "नहीं",
    unanswered: "उत्तर नहीं दिया",
    checked: "सूची में तैयार चिह्नित",
    unchecked: "तैयार चिह्नित नहीं",
    noIssues: "कोई संगति चेतावनी नहीं मिली।",
    privacy: "गोपनीयता: यह सारांश ब्राउज़र में बना है। दस्तावेज़ फ़ाइलें शामिल या अपलोड नहीं होतीं। वर्तमान नियम आधिकारिक पोर्टल पर जाँचें।",
  };

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  if (locale === "hi") {
    const font = await loadFont();
    pdf.addFileToVFS("NotoSansDevanagari.ttf", font);
    pdf.addFont("NotoSansDevanagari.ttf", fontName, "normal");
  }
  pdf.setFont(fontName, "normal");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const width = pageWidth - margin * 2;
  let y = 18;

  const ensureSpace = (height: number) => {
    if (y + height <= pageHeight - 18) return;
    pdf.addPage();
    pdf.setFont(fontName, "normal");
    y = 18;
  };
  const lines = (text: string, maxWidth = width) => pdf.splitTextToSize(text || "-", maxWidth) as string[];
  const writeMixedScript = (text: string, size: number, colour: [number, number, number], indent: number) => {
    const startX = margin + indent;
    const maxX = pageWidth - margin;
    const lineHeight = Math.max(4.6, size * 0.45);
    let x = startX;

    ensureSpace(lineHeight + 2);
    pdf.setFontSize(size);
    pdf.setTextColor(...colour);
    for (const token of (text || "-").split(/(\s+)/).filter(Boolean)) {
      const tokenFont = /[\u0900-\u097f]/.test(token) ? fontName : "helvetica";
      pdf.setFont(tokenFont, "normal");
      const tokenWidth = pdf.getTextWidth(token);
      if (!/^\s+$/.test(token) && x > startX && x + tokenWidth > maxX) {
        y += lineHeight;
        ensureSpace(lineHeight + 2);
        x = startX;
      }
      if (/^\s+$/.test(token)) {
        if (x > startX) x += tokenWidth;
      } else {
        pdf.text(token, x, y);
        x += tokenWidth;
      }
    }
    pdf.setFont(fontName, "normal");
    y += lineHeight + 2;
  };
  const write = (text: string, size = 9, colour: [number, number, number] = [45, 55, 49], indent = 0) => {
    if (locale === "hi") {
      writeMixedScript(text, size, colour, indent);
      return;
    }
    pdf.setFontSize(size);
    pdf.setTextColor(...colour);
    const wrapped = lines(text, width - indent);
    ensureSpace(wrapped.length * 4.6 + 2);
    pdf.text(wrapped, margin + indent, y);
    y += wrapped.length * 4.6 + 2;
  };
  const section = (title: string) => {
    ensureSpace(12);
    y += 3;
    pdf.setFillColor(23, 107, 75);
    pdf.rect(margin, y - 4, width, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(title, margin + 3, y + 1.4);
    y += 9;
  };

  pdf.setFillColor(23, 107, 75);
  pdf.rect(0, 0, pageWidth, 8, "F");
  write(labels.title, 18, [23, 67, 48]);
  write(form.title[locale], 12, [30, 40, 34]);
  write(`${labels.generated}: ${new Intl.DateTimeFormat(locale === "en" ? "en-IN" : "hi-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}`, 7, [105, 115, 108]);

  section(labels.eligibility);
  input.eligibility.forEach((question) => {
    const answer = input.eligibilityAnswers[question.id];
    write(`${question.prompt[locale]}: ${answer === undefined ? labels.unanswered : answer ? labels.yes : labels.no}`, 8);
  });

  section(labels.answers);
  input.fields.forEach((field) => {
    const sensitivity = getFieldEnhancement(input.serviceId, field.id).sensitivity;
    const shouldRedact = input.redactionMode === "personal" ? sensitivity !== "standard" : input.redactionMode === "sensitive" && sensitivity === "sensitive";
    write(`${field.label[locale]}: ${shouldRedact ? redact(input.values[field.id]) : input.values[field.id] || "-"}`, 8);
  });

  section(labels.documents);
  input.documents.forEach((document) => {
    const inspection = input.inspections[document.id];
    const status = inspection ? `${inspection.name} — ${inspection.message}` : input.completedDocs.includes(document.id) ? labels.checked : labels.unchecked;
    write(`${document.title[locale]}: ${status}`, 8);
  });

  section(labels.warnings);
  if (input.issues.length) input.issues.forEach((warning) => write(`• ${warning.message[locale]}`, 8, [144, 83, 24]));
  else write(labels.noIssues, 8, [23, 107, 75]);

  const failedEligibility = input.eligibility.filter((question) => input.eligibilityAnswers[question.id] !== undefined && input.eligibilityAnswers[question.id] !== question.expected);
  if (failedEligibility.length) {
    section(labels.unresolved);
    failedEligibility.forEach((question) => {
      const severity = eligibilityEnhancements[input.serviceId]?.[question.id]?.severity ?? "blocker";
      write(`• ${severity.toUpperCase()}: ${question.failMessage[locale]}`, 8, [144, 54, 43]);
    });
  }

  section(labels.instructions);
  write(`${labels.fee}: ${input.instructions.fee[locale]}`, 8);
  write(`${labels.timing}: ${input.instructions.timing[locale]}`, 8);
  write(`${labels.submission}: ${input.instructions.submission[locale]}`, 8);
  write(`${labels.deadline}: ${input.instructions.deadline[locale]}`, 8);
  write(`${form.sources[0].title}: ${form.sources[0].url}`, 7, [40, 85, 120]);
  const verifiedOn = serviceEnhancements[input.serviceId]?.verifiedOn;
  if (verifiedOn) write(`${labels.sourceDate}: ${new Intl.DateTimeFormat(locale === "en" ? "en-IN" : "hi-IN", { dateStyle: "long" }).format(new Date(`${verifiedOn}T00:00:00`))}`, 7, [74, 86, 78]);

  if (input.includeQr) {
    ensureSpace(40);
    const qrData = await toDataURL(form.portalUrl, { width: 320, margin: 1, errorCorrectionLevel: "M" });
    write(labels.qr, 8, [23, 67, 48]);
    pdf.addImage(qrData, "PNG", margin, y, 28, 28);
    pdf.link(margin, y, 28, 28, { url: form.portalUrl });
    y += 32;
  }

  ensureSpace(18);
  y += 4;
  pdf.setDrawColor(205, 212, 206);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 6;
  write(labels.privacy, 7, [100, 108, 102]);

  pdf.save(`saral-form-${input.serviceId}-preparation.pdf`);
}
