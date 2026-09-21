import type { LocalizedText } from "@/data/forms";

export type RuleSeverity = "blocker" | "advisory" | "information";

export type EligibilityEnhancement = {
  severity: RuleSeverity;
  explanation: LocalizedText;
  ruleLabel: LocalizedText;
  ruleUrl: string;
};

export type FieldEnhancement = {
  examples: LocalizedText[];
  officialSection: LocalizedText;
  sensitivity: "standard" | "personal" | "sensitive";
  privacy: LocalizedText;
};

export type DocumentEnhancement = {
  alternatives: LocalizedText[];
  requiredPages: LocalizedText;
  asksExpiry: boolean;
  asksIssuer: boolean;
};

export type ServiceEnhancement = {
  verifiedOn: string;
  expedited: LocalizedText;
  appointment: LocalizedText;
  simpleSummary: LocalizedText;
};

const officialRule = (service: string) => ({
  voter: "https://voters.eci.gov.in/",
  passport: "https://www.passportindia.gov.in/",
  pan: "https://tinpan.proteantech.in/services/pan/pan-index",
  certificate: "https://services.india.gov.in/",
  scholarship: "https://scholarships.gov.in/",
})[service] ?? "https://www.india.gov.in/";

export const serviceEnhancements: Record<string, ServiceEnhancement> = {
  voter: { verifiedOn: "2026-09-17", expedited: { en: "No expedited Form 6 route is listed; verification follows the electoral-roll process.", hi: "फॉर्म 6 के लिए अलग त्वरित मार्ग सूचीबद्ध नहीं है; सत्यापन मतदाता सूची प्रक्रिया के अनुसार होता है।" }, appointment: { en: "No routine appointment is required for online filing; an officer may contact you for verification.", hi: "ऑनलाइन आवेदन के लिए सामान्यतः अपॉइंटमेंट नहीं चाहिए; अधिकारी सत्यापन के लिए संपर्क कर सकता है।" }, simpleSummary: { en: "Check that you are eligible, collect age and address proof, then prepare your Form 6 details.", hi: "पात्रता जाँचें, आयु और पते का प्रमाण जुटाएँ, फिर फॉर्म 6 का विवरण तैयार करें।" } },
  passport: { verifiedOn: "2026-09-17", expedited: { en: "Tatkaal may be available with different fees and document rules; Passport Seva decides eligibility.", hi: "तत्काल सेवा अलग शुल्क और दस्तावेज़ नियमों के साथ उपलब्ध हो सकती है; पात्रता पासपोर्ट सेवा तय करती है।" }, appointment: { en: "A PSK/POPSK appointment is normally required after online payment and scheduling.", hi: "ऑनलाइन भुगतान और समय चुनने के बाद सामान्यतः PSK/POPSK अपॉइंटमेंट आवश्यक है।" }, simpleSummary: { en: "Choose fresh or re-issue, prepare identity and address records, then book the required visit.", hi: "नया या पुनः जारी चुनें, पहचान और पता रिकॉर्ड तैयार करें, फिर आवश्यक मुलाकात बुक करें।" } },
  pan: { verifiedOn: "2026-09-17", expedited: { en: "No separate expedited route is promised; digital processing may be faster when verification succeeds.", hi: "अलग त्वरित मार्ग का वादा नहीं है; सत्यापन सफल होने पर डिजिटल प्रक्रिया तेज़ हो सकती है।" }, appointment: { en: "No appointment is normally required for a fully digital application; physical documents may be requested for other modes.", hi: "पूरी तरह डिजिटल आवेदन में सामान्यतः अपॉइंटमेंट नहीं चाहिए; अन्य तरीकों में भौतिक दस्तावेज़ माँगे जा सकते हैं।" }, simpleSummary: { en: "Apply for one PAN only. Match your identity, birth, address, and Aadhaar records.", hi: "केवल एक पैन के लिए आवेदन करें। पहचान, जन्म, पता और आधार रिकॉर्ड मिलाएँ।" } },
  certificate: { verifiedOn: "2026-09-17", expedited: { en: "Expedited options, if any, are set by the state and certificate service.", hi: "त्वरित विकल्प, यदि हों, राज्य और प्रमाण पत्र सेवा तय करती है।" }, appointment: { en: "A local visit or field verification may be required depending on state rules.", hi: "राज्य नियमों के अनुसार स्थानीय कार्यालय जाना या क्षेत्र सत्यापन आवश्यक हो सकता है।" }, simpleSummary: { en: "Choose the certificate and state, then prepare evidence that supports the claim.", hi: "प्रमाण पत्र और राज्य चुनें, फिर दावे का समर्थन करने वाला प्रमाण तैयार करें।" } },
  scholarship: { verifiedOn: "2026-09-17", expedited: { en: "No expedited route is offered; verification follows scheme and institution stages.", hi: "त्वरित मार्ग उपलब्ध नहीं है; सत्यापन योजना और संस्थान के चरणों में होता है।" }, appointment: { en: "No portal appointment is normally required, but the institution may request verification.", hi: "पोर्टल अपॉइंटमेंट सामान्यतः नहीं चाहिए, लेकिन संस्थान सत्यापन माँग सकता है।" }, simpleSummary: { en: "Check the scheme deadline and eligibility, then match student, income, institution, and bank records.", hi: "योजना की अंतिम तिथि और पात्रता जाँचें, फिर विद्यार्थी, आय, संस्थान और बैंक रिकॉर्ड मिलाएँ।" } },
};

export const eligibilityEnhancements: Record<string, Record<string, EligibilityEnhancement>> = Object.fromEntries(
  Object.entries({
    voter: { citizen: "blocker", adult: "blocker", resident: "blocker" },
    passport: { citizen: "blocker", records: "advisory" },
    pan: { singlePan: "blocker", identity: "advisory" },
    certificate: { jurisdiction: "blocker", evidence: "advisory" },
    scholarship: { enrolled: "blocker", scheme: "advisory", bank: "advisory" },
  }).map(([service, questions]) => [service, Object.fromEntries(Object.entries(questions).map(([id, severity]) => [id, {
    severity,
    explanation: { en: severity === "blocker" ? "A No answer may make this application route unsuitable. Confirm the official rule before continuing." : "A No answer does not always make you ineligible, but you should resolve it before submission.", hi: severity === "blocker" ? "नहीं उत्तर से यह आवेदन मार्ग अनुपयुक्त हो सकता है। आगे बढ़ने से पहले आधिकारिक नियम जाँचें।" : "नहीं उत्तर हमेशा अपात्र नहीं बनाता, लेकिन जमा करने से पहले इसे हल करें।" },
    ruleLabel: { en: "Read the official eligibility rule", hi: "आधिकारिक पात्रता नियम पढ़ें" },
    ruleUrl: officialRule(service),
  }]))])
) as Record<string, Record<string, EligibilityEnhancement>>;

const commonFields: Record<string, FieldEnhancement> = {
  fullName: { examples: [{ en: "Asha Verma", hi: "आशा वर्मा" }], officialSection: { en: "Applicant identity details", hi: "आवेदक पहचान विवरण" }, sensitivity: "personal", privacy: { en: "Use the spelling supported by your official records.", hi: "आधिकारिक रिकॉर्ड से समर्थित वर्तनी उपयोग करें।" } },
  dateOfBirth: { examples: [{ en: "15 August 2000", hi: "15 अगस्त 2000" }], officialSection: { en: "Identity and eligibility", hi: "पहचान और पात्रता" }, sensitivity: "sensitive", privacy: { en: "Date of birth is sensitive identity data and stays in this browser draft.", hi: "जन्म तिथि संवेदनशील पहचान डेटा है और इसी ब्राउज़र ड्राफ्ट में रहती है।" } },
  mobile: { examples: [{ en: "9876543210", hi: "9876543210" }], officialSection: { en: "Contact details", hi: "संपर्क विवरण" }, sensitivity: "sensitive", privacy: { en: "Used for official communication or OTP; it is not uploaded by this prototype.", hi: "आधिकारिक संचार या OTP के लिए; यह प्रोटोटाइप इसे अपलोड नहीं करता।" } },
  address: { examples: [{ en: "House 12, MG Road, Pune, Maharashtra 411001", hi: "मकान 12, एमजी रोड, पुणे, महाराष्ट्र 411001" }], officialSection: { en: "Address or residence", hi: "पता या निवास" }, sensitivity: "sensitive", privacy: { en: "A complete address can reveal your location; it remains local until you use the official portal.", hi: "पूरा पता आपका स्थान बता सकता है; आधिकारिक पोर्टल उपयोग करने तक यह स्थानीय रहता है।" } },
  aadhaar: { examples: [{ en: "12 digits without spaces", hi: "बिना स्पेस के 12 अंक" }], officialSection: { en: "Identity verification", hi: "पहचान सत्यापन" }, sensitivity: "sensitive", privacy: { en: "Aadhaar is highly sensitive. The preparation PDF can mask it.", hi: "आधार अत्यंत संवेदनशील है। तैयारी PDF में इसे छिपाया जा सकता है।" } },
  bankAccount: { examples: [{ en: "9–18 digit account number", hi: "9–18 अंकों की खाता संख्या" }], officialSection: { en: "Benefit payment details", hi: "लाभ भुगतान विवरण" }, sensitivity: "sensitive", privacy: { en: "Bank details are sensitive and should only be submitted on the official portal.", hi: "बैंक विवरण संवेदनशील हैं और केवल आधिकारिक पोर्टल पर जमा करें।" } },
};

export const getFieldEnhancement = (serviceId: string, fieldId: string): FieldEnhancement => commonFields[fieldId] ?? {
  examples: [{ en: "Use the value exactly as shown on the supporting record.", hi: "सहायक रिकॉर्ड में जैसा है वैसा ही मान उपयोग करें।" }],
  officialSection: { en: `${serviceId} application details`, hi: `${serviceId} आवेदन विवरण` },
  sensitivity: "standard",
  privacy: { en: "This value is saved only in your local browser draft.", hi: "यह मान केवल आपके स्थानीय ब्राउज़र ड्राफ्ट में सहेजा जाता है।" },
};

const generalDocument: DocumentEnhancement = { alternatives: [{ en: "Check the official portal for currently accepted alternatives.", hi: "वर्तमान में स्वीकृत विकल्प आधिकारिक पोर्टल पर जाँचें।" }], requiredPages: { en: "Upload all pages that contain the supporting details.", hi: "सहायक विवरण वाले सभी पृष्ठ अपलोड करें।" }, asksExpiry: false, asksIssuer: true };

export const getDocumentEnhancement = (serviceId: string, documentId: string): DocumentEnhancement => {
  if (documentId.includes("passport")) return { alternatives: [{ en: "Current or most recently expired passport, as applicable", hi: "लागू होने पर वर्तमान या सबसे हाल का समाप्त पासपोर्ट" }], requiredPages: { en: "Photo page and required observation/address pages", hi: "फोटो पृष्ठ और आवश्यक टिप्पणी/पता पृष्ठ" }, asksExpiry: true, asksIssuer: true };
  if (documentId === "photo") return { alternatives: [{ en: "Recent colour digital photograph", hi: "हाल का रंगीन डिजिटल फोटो" }], requiredPages: { en: "One clear image", hi: "एक स्पष्ट चित्र" }, asksExpiry: false, asksIssuer: false };
  if (documentId === "bank") return { alternatives: [{ en: "Passbook first page or cancelled cheque where accepted", hi: "स्वीकृत होने पर पासबुक प्रथम पृष्ठ या रद्द चेक" }], requiredPages: { en: "Account-holder and IFSC page", hi: "खाताधारक और IFSC वाला पृष्ठ" }, asksExpiry: false, asksIssuer: true };
  return generalDocument;
};
