"use client";

import { useState } from "react";
import {
  AlertTriangle, CalendarClock, Check, CheckCircle2, Clock3, ExternalLink,
  FastForward, FileSearch, FileUp, MapPin, ScanText, Send, ShieldCheck, Trash2, WalletCards, XCircle,
} from "lucide-react";
import { eligibilityEnhancements, getDocumentEnhancement, type ServiceEnhancement } from "@/data/enhancements";
import type { DocumentGuide, Locale } from "@/data/forms";
import type { ConsistencyIssue, EligibilityQuestion, ServiceInstructions } from "@/data/readiness";
import { inspectDocument, type DocumentInspection } from "@/utils/documentInspection";
import { runLocalOcr, type LocalOcrResult } from "@/utils/localOcr";

export type DocumentDetails = { issuer: string; expiry: string; pagesConfirmed: boolean };

type Props = {
  locale: Locale;
  questions: EligibilityQuestion[];
  answers: Record<string, boolean | undefined>;
  onAnswer: (id: string, answer: boolean) => void;
  instructions: ServiceInstructions;
  sourceUrl: string;
  issues: ConsistencyIssue[];
  documents: DocumentGuide[];
  inspections: Record<string, DocumentInspection>;
  onInspection: (id: string, inspection: DocumentInspection) => void;
  onRemoveInspection: (id: string) => void;
  possessedDocuments: string[];
  onTogglePossession: (id: string) => void;
  documentDetails?: Record<string, DocumentDetails>;
  onDocumentDetails: (id: string, details: DocumentDetails) => void;
  formValues: Record<string, string>;
  eligibilityError: boolean;
  serviceId: string;
  serviceEnhancement: ServiceEnhancement;
};

export default function ApplicationReadiness({ locale, questions, answers, onAnswer, instructions, sourceUrl, issues, documents, inspections, onInspection, onRemoveInspection, possessedDocuments, onTogglePossession, documentDetails = {}, onDocumentDetails, formValues, eligibilityError, serviceId, serviceEnhancement }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [ocrResults, setOcrResults] = useState<Record<string, LocalOcrResult>>({});
  const [ocrProgress, setOcrProgress] = useState<Record<string, number>>({});
  const [ocrErrors, setOcrErrors] = useState<Record<string, string>>({});
  const t = locale === "en" ? {
    title: "Application readiness", intro: "Check eligibility, evidence, and current submission guidance before review.",
    eligibility: "Eligibility pre-check", eligibilityNote: "This is guidance, not an official eligibility decision.", yes: "Yes", no: "No",
    eligibilityError: "Answer every eligibility question and resolve any result marked Check first.", likely: "Looks eligible", check: "Check first", unanswered: "Answer needed",
    guidance: "Official application guidance", fee: "Fee", timing: "Processing", submission: "Submission", deadline: "Deadline", verify: "Verify current details",
    blocker: "Eligibility blocker", advisory: "Preparation advisory", information: "Information", why: "Why this matters", expedited: "Expedited route", appointment: "Appointment", checked: "Source checked",
    consistency: "Consistency checks", noIssues: "No consistency warnings detected in the current answers.",
    warning: "Warning", notice: "Check",
    documents: "Local document checks", documentsNote: "Optional preparation check. PDF, JPG, or PNG up to 5 MB. Files never leave this browser.", choose: "Check a file", replace: "Check another file",
    possess: "I have this document", fileChecked: "File inspected", remove: "Remove file", alternatives: "Possible alternatives", pages: "Pages to include", issuer: "Issuer", expiry: "Expiry", pagesConfirmed: "Required pages included",
    runOcr: "Run local OCR", ocrRunning: "Reading locally", ocrNote: "Optional and advisory. OCR runs in this browser; its language model may be downloaded. No authenticity check is performed.", ocrMatches: "prepared values found", extracted: "Extracted text preview", confidence: "OCR confidence",
  } : {
    title: "आवेदन तैयारी", intro: "समीक्षा से पहले पात्रता, प्रमाण और वर्तमान जमा मार्गदर्शन जाँचें।",
    eligibility: "पात्रता पूर्व-जाँच", eligibilityNote: "यह मार्गदर्शन है, आधिकारिक पात्रता निर्णय नहीं।", yes: "हाँ", no: "नहीं",
    eligibilityError: "हर पात्रता प्रश्न का उत्तर दें और पहले जाँचें के रूप में चिह्नित परिणाम हल करें।", likely: "पात्रता ठीक लगती है", check: "पहले जाँचें", unanswered: "उत्तर आवश्यक",
    guidance: "आधिकारिक आवेदन मार्गदर्शन", fee: "शुल्क", timing: "प्रसंस्करण", submission: "जमा करना", deadline: "अंतिम तिथि", verify: "वर्तमान विवरण जाँचें",
    blocker: "पात्रता अवरोध", advisory: "तैयारी सलाह", information: "जानकारी", why: "यह क्यों महत्वपूर्ण है", expedited: "त्वरित मार्ग", appointment: "अपॉइंटमेंट", checked: "स्रोत जाँचा गया",
    consistency: "संगति जाँच", noIssues: "वर्तमान उत्तरों में कोई संगति चेतावनी नहीं मिली।",
    warning: "चेतावनी", notice: "जाँचें",
    documents: "स्थानीय दस्तावेज़ जाँच", documentsNote: "वैकल्पिक तैयारी जाँच। 5 MB तक PDF, JPG या PNG। फ़ाइलें इस ब्राउज़र से बाहर नहीं जातीं।", choose: "फ़ाइल जाँचें", replace: "दूसरी फ़ाइल जाँचें",
    possess: "यह दस्तावेज़ मेरे पास है", fileChecked: "फ़ाइल जाँची गई", remove: "फ़ाइल हटाएँ", alternatives: "संभावित विकल्प", pages: "शामिल किए जाने वाले पृष्ठ", issuer: "जारीकर्ता", expiry: "समाप्ति", pagesConfirmed: "आवश्यक पृष्ठ शामिल हैं",
    runOcr: "स्थानीय OCR चलाएँ", ocrRunning: "स्थानीय रूप से पढ़ा जा रहा है", ocrNote: "वैकल्पिक और सलाह मात्र। OCR इस ब्राउज़र में चलता है; इसका भाषा मॉडल डाउनलोड हो सकता है। प्रामाणिकता जाँच नहीं होती।", ocrMatches: "तैयार मान मिले", extracted: "निकाले गए टेक्स्ट का पूर्वावलोकन", confidence: "OCR विश्वसनीयता",
  };

  const handleFile = async (documentId: string, file?: File) => {
    if (!file) return;
    setSelectedFiles((current) => ({ ...current, [documentId]: file }));
    setOcrResults((current) => { const next = { ...current }; delete next[documentId]; return next; });
    onInspection(documentId, await inspectDocument(file, locale));
  };

  const handleRemove = (documentId: string) => {
    setSelectedFiles((current) => { const next = { ...current }; delete next[documentId]; return next; });
    setOcrResults((current) => { const next = { ...current }; delete next[documentId]; return next; });
    setOcrErrors((current) => { const next = { ...current }; delete next[documentId]; return next; });
    onRemoveInspection(documentId);
  };

  const handleOcr = async (documentId: string) => {
    const file = selectedFiles[documentId];
    if (!file) return;
    setOcrProgress((current) => ({ ...current, [documentId]: 0 }));
    setOcrErrors((current) => ({ ...current, [documentId]: "" }));
    try {
      const result = await runLocalOcr(file, locale, formValues, (progress) => setOcrProgress((current) => ({ ...current, [documentId]: progress })));
      setOcrResults((current) => ({ ...current, [documentId]: result }));
    } catch (error) {
      setOcrErrors((current) => ({ ...current, [documentId]: error instanceof Error ? error.message : "OCR failed" }));
    } finally {
      setOcrProgress((current) => { const next = { ...current }; delete next[documentId]; return next; });
    }
  };

  return (
    <section className="readiness-workspace" aria-labelledby="readiness-title">
      <div className="readiness-heading"><div><span><ShieldCheck size={17} /> {t.title}</span><h2 id="readiness-title">{t.intro}</h2></div></div>
      <div className="readiness-grid">
        <section className={`readiness-card eligibility-card ${eligibilityError ? "has-error" : ""}`}>
          <div className="readiness-card-title"><CheckCircle2 size={18} /><div><strong>{t.eligibility}</strong><small>{t.eligibilityNote}</small></div></div>
          {eligibilityError && <p className="readiness-error" role="alert"><AlertTriangle size={14} /> {t.eligibilityError}</p>}
          <div className="eligibility-list">{questions.map((question) => {
            const answer = answers[question.id];
            const passed = answer === question.expected;
            const enhancement = eligibilityEnhancements[serviceId]?.[question.id];
            const severity = enhancement?.severity ?? "blocker";
            const severityLabel = severity === "blocker" ? t.blocker : severity === "advisory" ? t.advisory : t.information;
            return <div className="eligibility-question" key={question.id}>
              <p>{question.prompt[locale]}<em className={`rule-severity ${severity}`}>{severityLabel}</em></p>
              <div className="binary-picker" role="group" aria-label={question.prompt[locale]}>
                <button type="button" className={answer === true ? "selected" : ""} onClick={() => onAnswer(question.id, true)}>{t.yes}</button>
                <button type="button" className={answer === false ? "selected" : ""} onClick={() => onAnswer(question.id, false)}>{t.no}</button>
              </div>
              <span className={answer === undefined ? "pending" : passed ? "passed" : "failed"}>{answer === undefined ? t.unanswered : passed ? <><Check size={12} /> {t.likely}</> : <><XCircle size={12} /> {t.check}</>}</span>
              {answer !== undefined && !passed && <div className="eligibility-detail"><strong>{question.failMessage[locale]}</strong>{enhancement && <><span>{enhancement.explanation[locale]}</span><a href={enhancement.ruleUrl} target="_blank" rel="noreferrer">{enhancement.ruleLabel[locale]} <ExternalLink size={11} /></a></>}</div>}
            </div>;
          })}</div>
        </section>

        <section className="readiness-card instructions-card">
          <div className="readiness-card-title"><FileSearch size={18} /><div><strong>{t.guidance}</strong><small>{t.verify}</small></div></div>
          <dl className="instruction-list">
            <div><dt><WalletCards size={15} /> {t.fee}</dt><dd>{instructions.fee[locale]}</dd></div>
            <div><dt><Clock3 size={15} /> {t.timing}</dt><dd>{instructions.timing[locale]}</dd></div>
            <div><dt><Send size={15} /> {t.submission}</dt><dd>{instructions.submission[locale]}</dd></div>
            <div><dt><CalendarClock size={15} /> {t.deadline}</dt><dd>{instructions.deadline[locale]}</dd></div>
            <div><dt><FastForward size={15} /> {t.expedited}</dt><dd>{serviceEnhancement.expedited[locale]}</dd></div>
            <div><dt><MapPin size={15} /> {t.appointment}</dt><dd>{serviceEnhancement.appointment[locale]}</dd></div>
          </dl>
          <a href={sourceUrl} target="_blank" rel="noreferrer">{t.verify} <ExternalLink size={13} /></a>
          <p className="verified-date"><CheckCircle2 size={12} /> {t.checked}: <time dateTime={serviceEnhancement.verifiedOn}>{new Intl.DateTimeFormat(locale === "en" ? "en-IN" : "hi-IN", { dateStyle: "medium" }).format(new Date(`${serviceEnhancement.verifiedOn}T00:00:00`))}</time></p>
        </section>

        <section className="readiness-card consistency-card">
          <div className="readiness-card-title"><AlertTriangle size={18} /><div><strong>{t.consistency}</strong></div></div>
          {issues.length === 0 ? <p className="consistency-clear"><CheckCircle2 size={16} /> {t.noIssues}</p> : <ul>{issues.map((issue, index) => <li className={issue.severity} key={`${issue.fieldId}-${index}`}><AlertTriangle size={14} /><span><strong>{issue.severity === "warning" ? t.warning : t.notice}</strong>{issue.message[locale]}</span></li>)}</ul>}
        </section>

        <section className="readiness-card document-inspection-card">
          <div className="readiness-card-title"><FileUp size={18} /><div><strong>{t.documents}</strong><small>{t.documentsNote}</small></div></div>
          <div className="inspection-list">{documents.map((document) => {
            const inspection = inspections[document.id];
            const enhancement = getDocumentEnhancement(serviceId, document.id);
            const details = documentDetails[document.id] ?? { issuer: "", expiry: "", pagesConfirmed: false };
            const ocrResult = ocrResults[document.id];
            const progress = ocrProgress[document.id];
            return <div className="inspection-row" key={document.id}>
              <div><strong>{document.title[locale]}</strong><label className="possession-check"><input type="checkbox" checked={possessedDocuments.includes(document.id)} onChange={() => onTogglePossession(document.id)} /> {t.possess}</label>{inspection && <small className={inspection.status}>{inspection.message}</small>}</div>
              <label className="file-check-button"><FileUp size={13} /> {inspection ? t.replace : t.choose}<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => handleFile(document.id, event.target.files?.[0])} /></label>
              <div className="document-expectations"><p><strong>{t.alternatives}</strong>{enhancement.alternatives.map((alternative) => alternative[locale]).join("; ")}</p><p><strong>{t.pages}</strong>{enhancement.requiredPages[locale]}</p></div>
              <div className="document-metadata">
                {enhancement.asksIssuer && <label><span>{t.issuer}</span><input value={details.issuer} onChange={(event) => onDocumentDetails(document.id, { ...details, issuer: event.target.value })} /></label>}
                {enhancement.asksExpiry && <label><span>{t.expiry}</span><input type="date" value={details.expiry} onChange={(event) => onDocumentDetails(document.id, { ...details, expiry: event.target.value })} /></label>}
                <label className="pages-check"><input type="checkbox" checked={details.pagesConfirmed} onChange={(event) => onDocumentDetails(document.id, { ...details, pagesConfirmed: event.target.checked })} /> {t.pagesConfirmed}</label>
              </div>
              {inspection && <div className="inspection-file"><p><span>{inspection.name}</span><small>{(inspection.size / 1024 / 1024).toFixed(2)} MB{inspection.dimensions ? ` · ${inspection.dimensions.width} × ${inspection.dimensions.height}px` : ""}</small></p>{inspection.qualityNotes?.map((note) => <small key={note}><AlertTriangle size={11} /> {note}</small>)}<button type="button" onClick={() => handleRemove(document.id)}><Trash2 size={12} /> {t.remove}</button></div>}
              {inspection && selectedFiles[document.id]?.type.startsWith("image/") && <div className="ocr-panel"><p>{t.ocrNote}</p><button type="button" disabled={progress !== undefined} onClick={() => handleOcr(document.id)}><ScanText size={13} /> {progress !== undefined ? `${t.ocrRunning} ${progress}%` : t.runOcr}</button>{ocrErrors[document.id] && <small className="ocr-error">{ocrErrors[document.id]}</small>}{ocrResult && <div className="ocr-result"><strong>{t.confidence}: {ocrResult.confidence}% · {ocrResult.matchedFields.length} {t.ocrMatches}</strong><details><summary>{t.extracted}</summary><pre>{ocrResult.text || "-"}</pre></details></div>}</div>}
            </div>;
          })}</div>
        </section>
      </div>
    </section>
  );
}
