import { LocalizedText } from "@/data/forms";

export type EligibilityQuestion = {
  id: string;
  prompt: LocalizedText;
  expected: boolean;
  failMessage: LocalizedText;
};

export type ServiceInstructions = {
  fee: LocalizedText;
  timing: LocalizedText;
  submission: LocalizedText;
  deadline: LocalizedText;
};

export type ConsistencyIssue = {
  fieldId: string;
  message: LocalizedText;
  severity: "warning" | "notice";
};

const yes = true;

export const eligibilityQuestions: Record<string, EligibilityQuestion[]> = {
  voter: [
    { id: "citizen", prompt: { en: "Are you an Indian citizen?", hi: "क्या आप भारतीय नागरिक हैं?" }, expected: yes, failMessage: { en: "Form 6 is for Indian citizens.", hi: "फॉर्म 6 भारतीय नागरिकों के लिए है।" } },
    { id: "adult", prompt: { en: "Will you be at least 18 on the applicable qualifying date?", hi: "क्या लागू अर्हता तिथि पर आपकी आयु कम से कम 18 वर्ष होगी?" }, expected: yes, failMessage: { en: "You must meet the Election Commission's age requirement.", hi: "आपको निर्वाचन आयोग की आयु आवश्यकता पूरी करनी होगी।" } },
    { id: "resident", prompt: { en: "Do you ordinarily live at the address you will enter?", hi: "क्या आप सामान्यतः उस पते पर रहते हैं जिसे दर्ज करेंगे?" }, expected: yes, failMessage: { en: "Form 6 requires your ordinary residence, not merely a hometown address.", hi: "फॉर्म 6 में सामान्य निवास चाहिए, केवल गृह नगर का पता नहीं।" } },
  ],
  passport: [
    { id: "citizen", prompt: { en: "Are you applying for an Indian passport as an Indian citizen?", hi: "क्या आप भारतीय नागरिक के रूप में भारतीय पासपोर्ट के लिए आवेदन कर रहे हैं?" }, expected: yes, failMessage: { en: "This preparation flow covers Indian passport applications.", hi: "यह तैयारी प्रक्रिया भारतीय पासपोर्ट आवेदनों के लिए है।" } },
    { id: "records", prompt: { en: "Can you support your identity, birth details, and present address with accepted records?", hi: "क्या आप पहचान, जन्म विवरण और वर्तमान पते को स्वीकृत रिकॉर्ड से प्रमाणित कर सकते हैं?" }, expected: yes, failMessage: { en: "Check Passport Seva's document adviser before continuing.", hi: "आगे बढ़ने से पहले पासपोर्ट सेवा का दस्तावेज़ सलाहकार जाँचें।" } },
  ],
  pan: [
    { id: "singlePan", prompt: { en: "Are you applying for only one PAN, or correcting your existing PAN?", hi: "क्या आप केवल एक पैन के लिए आवेदन कर रहे हैं या मौजूदा पैन में सुधार कर रहे हैं?" }, expected: yes, failMessage: { en: "A person must not hold or apply for more than one PAN.", hi: "किसी व्यक्ति को एक से अधिक पैन रखना या आवेदन करना नहीं चाहिए।" } },
    { id: "identity", prompt: { en: "Do you have accepted identity, address, and date-of-birth evidence?", hi: "क्या आपके पास स्वीकृत पहचान, पता और जन्म-तिथि प्रमाण है?" }, expected: yes, failMessage: { en: "Prepare accepted evidence before starting the official application.", hi: "आधिकारिक आवेदन शुरू करने से पहले स्वीकृत प्रमाण तैयार करें।" } },
  ],
  certificate: [
    { id: "jurisdiction", prompt: { en: "Do you meet the selected state's residence or jurisdiction requirement?", hi: "क्या आप चुने गए राज्य की निवास या अधिकार-क्षेत्र आवश्यकता पूरी करते हैं?" }, expected: yes, failMessage: { en: "Certificate eligibility is controlled by the issuing state or local authority.", hi: "प्रमाण पत्र पात्रता जारीकर्ता राज्य या स्थानीय प्राधिकरण तय करता है।" } },
    { id: "evidence", prompt: { en: "Can you provide evidence for the income, caste, or domicile claim?", hi: "क्या आप आय, जाति या निवास दावे का प्रमाण दे सकते हैं?" }, expected: yes, failMessage: { en: "The competent authority will require claim-specific evidence.", hi: "सक्षम प्राधिकरण को दावे से संबंधित प्रमाण चाहिए होगा।" } },
  ],
  scholarship: [
    { id: "enrolled", prompt: { en: "Are you currently admitted to an eligible institution or course?", hi: "क्या आप वर्तमान में पात्र संस्थान या पाठ्यक्रम में प्रवेशित हैं?" }, expected: yes, failMessage: { en: "Most schemes require current enrollment verified by the institution.", hi: "अधिकांश योजनाओं में संस्थान द्वारा सत्यापित वर्तमान प्रवेश आवश्यक है।" } },
    { id: "scheme", prompt: { en: "Have you checked the selected scheme's category, income, and academic rules?", hi: "क्या आपने चुनी गई योजना के श्रेणी, आय और शैक्षणिक नियम जाँचे हैं?" }, expected: yes, failMessage: { en: "Eligibility differs by scheme; confirm it on the National Scholarship Portal.", hi: "पात्रता योजना के अनुसार बदलती है; राष्ट्रीय छात्रवृत्ति पोर्टल पर पुष्टि करें।" } },
    { id: "bank", prompt: { en: "Do you have an active student bank account for benefit transfer?", hi: "क्या लाभ हस्तांतरण के लिए सक्रिय विद्यार्थी बैंक खाता है?" }, expected: yes, failMessage: { en: "An active, correctly named beneficiary account is normally required.", hi: "सक्रिय और सही नाम वाला लाभार्थी खाता सामान्यतः आवश्यक है।" } },
  ],
};

export const serviceInstructions: Record<string, ServiceInstructions> = {
  voter: { fee: { en: "No application fee for Form 6.", hi: "फॉर्म 6 के लिए आवेदन शुल्क नहीं है।" }, timing: { en: "Verification time varies by Electoral Registration Officer and field verification.", hi: "सत्यापन समय निर्वाचक रजिस्ट्रीकरण अधिकारी और क्षेत्र सत्यापन पर निर्भर करता है।" }, submission: { en: "Submit online through the Voters' Service Portal or through the local election office.", hi: "मतदाता सेवा पोर्टल या स्थानीय निर्वाचन कार्यालय के माध्यम से जमा करें।" }, deadline: { en: "Applications are accepted through continuous electoral-roll updating; verify election-period notices.", hi: "मतदाता सूची के सतत अद्यतन में आवेदन स्वीकार होते हैं; चुनाव अवधि की सूचनाएँ जाँचें।" } },
  passport: { fee: { en: "Fee depends on booklet, validity, age, normal/Tatkaal service, and application type.", hi: "शुल्क पुस्तिका, वैधता, आयु, सामान्य/तत्काल सेवा और आवेदन प्रकार पर निर्भर करता है।" }, timing: { en: "Appointment, police verification, and issue time vary by application category and location.", hi: "अपॉइंटमेंट, पुलिस सत्यापन और जारी होने का समय श्रेणी व स्थान के अनुसार बदलता है।" }, submission: { en: "Apply on Passport Seva, pay online, then attend the selected PSK/POPSK with originals.", hi: "पासपोर्ट सेवा पर आवेदन और ऑनलाइन भुगतान करें, फिर मूल दस्तावेज़ों के साथ चुने PSK/POPSK जाएँ।" }, deadline: { en: "No general annual deadline; appointment availability and document validity matter.", hi: "सामान्य वार्षिक समय-सीमा नहीं; अपॉइंटमेंट उपलब्धता और दस्तावेज़ वैधता महत्वपूर्ण है।" } },
  pan: { fee: { en: "The authorized provider calculates the current fee from delivery method and address.", hi: "अधिकृत प्रदाता वितरण विधि और पते के अनुसार वर्तमान शुल्क तय करता है।" }, timing: { en: "Processing depends on successful identity/document verification and dispatch choice.", hi: "प्रसंस्करण पहचान/दस्तावेज़ सत्यापन और वितरण विकल्प पर निर्भर करता है।" }, submission: { en: "Submit through the authorized Protean PAN service and follow its e-KYC, e-Sign, or document route.", hi: "अधिकृत प्रोटीन पैन सेवा से जमा करें और उसके ई-केवाईसी, ई-साइन या दस्तावेज़ मार्ग का पालन करें।" }, deadline: { en: "No general application deadline; tax or compliance events may create separate due dates.", hi: "सामान्य आवेदन समय-सीमा नहीं; कर या अनुपालन घटनाओं की अलग अंतिम तिथि हो सकती है।" } },
  certificate: { fee: { en: "Fee varies by certificate, state, service channel, and local rules.", hi: "शुल्क प्रमाण पत्र, राज्य, सेवा माध्यम और स्थानीय नियमों के अनुसार बदलता है।" }, timing: { en: "Processing and field verification differ by state, district, and certificate type.", hi: "प्रसंस्करण और क्षेत्र सत्यापन राज्य, ज़िले और प्रमाण पत्र प्रकार के अनुसार बदलते हैं।" }, submission: { en: "Use the relevant state e-District/service portal or designated local office.", hi: "संबंधित राज्य ई-डिस्ट्रिक्ट/सेवा पोर्टल या निर्धारित स्थानीय कार्यालय का उपयोग करें।" }, deadline: { en: "Check the receiving institution's deadline and the certificate's validity period.", hi: "प्राप्तकर्ता संस्था की अंतिम तिथि और प्रमाण पत्र की वैधता अवधि जाँचें।" } },
  scholarship: { fee: { en: "National Scholarship Portal applications do not normally charge an application fee.", hi: "राष्ट्रीय छात्रवृत्ति पोर्टल आवेदन में सामान्यतः आवेदन शुल्क नहीं होता।" }, timing: { en: "Institution, district/state, and scheme-level verification happen in stages.", hi: "संस्थान, ज़िला/राज्य और योजना-स्तरीय सत्यापन चरणों में होता है।" }, submission: { en: "Register and submit through NSP, then complete institution verification when required.", hi: "NSP पर पंजीकरण और आवेदन करें, फिर आवश्यक होने पर संस्थान सत्यापन पूरा करें।" }, deadline: { en: "Deadlines differ by scheme and academic year; verify the live NSP scheme notice.", hi: "अंतिम तिथियाँ योजना और शैक्षणिक वर्ष के अनुसार बदलती हैं; NSP की वर्तमान सूचना जाँचें।" } },
};

const issue = (fieldId: string, en: string, hi: string, severity: ConsistencyIssue["severity"] = "warning"): ConsistencyIssue => ({ fieldId, message: { en, hi }, severity });

export function getConsistencyIssues(serviceId: string, values: Record<string, string>): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const fullName = values.fullName?.trim().toLocaleLowerCase();

  if (fullName && values.relativeName?.trim().toLocaleLowerCase() === fullName) issues.push(issue("relativeName", "Applicant and relative names are identical; confirm this is intentional.", "आवेदक और रिश्तेदार के नाम समान हैं; पुष्टि करें कि यह सही है।"));
  if (fullName && fullName.replace(/[^\p{L}]/gu, "").length < 3) issues.push(issue("fullName", "The applicant name looks unusually short; single names can be valid, so compare it with the identity record.", "आवेदक का नाम असामान्य रूप से छोटा लगता है; एकल नाम मान्य हो सकते हैं, इसलिए पहचान रिकॉर्ड से मिलाएँ।", "notice"));
  if (values.dateOfBirth && new Date(`${values.dateOfBirth}T00:00:00`) > new Date()) issues.push(issue("dateOfBirth", "Date of birth cannot be in the future.", "जन्म तिथि भविष्य की नहीं हो सकती।"));
  if (values.dateOfBirth) {
    const oldestPlausible = new Date();
    oldestPlausible.setFullYear(oldestPlausible.getFullYear() - 125);
    if (new Date(`${values.dateOfBirth}T00:00:00`) < oldestPlausible) issues.push(issue("dateOfBirth", "The date of birth implies an age over 125; check the year.", "जन्म तिथि से आयु 125 वर्ष से अधिक होती है; वर्ष जाँचें।"));
  }
  if (values.address?.trim() && values.address.trim().length < 15) issues.push(issue("address", "The address looks too short to identify a complete postal location.", "पूरा डाक स्थान पहचानने के लिए पता बहुत छोटा लगता है।"));
  if (values.district && /^\d+$/.test(values.district.trim())) issues.push(issue("district", "District should be a place name, not only a number.", "ज़िला केवल संख्या नहीं, स्थान का नाम होना चाहिए।"));
  if (values.pinCode && /^(\d)\1{5}$/.test(values.pinCode.replace(/\s/g, ""))) issues.push(issue("pinCode", "This PIN repeats one digit throughout; verify it against the address proof or India Post.", "इस पिन में एक ही अंक दोहराया गया है; पता प्रमाण या इंडिया पोस्ट से जाँचें।"));
  if (values.annualIncome && !/^\d+(?:\.\d{1,2})?$/.test(values.annualIncome.replace(/[₹,\s]/g, ""))) issues.push(issue("annualIncome", "Enter annual income as a numeric amount so it can be checked consistently.", "वार्षिक आय संख्यात्मक राशि में दर्ज करें ताकि उसकी संगति जाँची जा सके।"));
  if (values.bankAccount && !/^\d{9,18}$/.test(values.bankAccount.replace(/\s/g, ""))) issues.push(issue("bankAccount", "Bank account numbers are usually 9 to 18 digits; verify this entry.", "बैंक खाता संख्या सामान्यतः 9 से 18 अंकों की होती है; प्रविष्टि जाँचें।"));
  if (values.bankAccount && /^(\d)\1{8,17}$/.test(values.bankAccount.replace(/\s/g, ""))) issues.push(issue("bankAccount", "The bank account repeats one digit throughout; compare it with the passbook.", "बैंक खाता संख्या में एक ही अंक दोहराया गया है; पासबुक से मिलाएँ।"));
  if (values.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(values.ifsc.toUpperCase().replace(/\s/g, ""))) issues.push(issue("ifsc", "The IFSC structure does not match four letters, zero, then six letters or digits.", "IFSC की संरचना चार अक्षर, शून्य, फिर छह अक्षर या अंक से मेल नहीं खाती।"));
  if (serviceId === "passport" && values.applicationType === "Re-issue" && values.oldPassportNumber && !/^[A-Z][0-9]{7}$/i.test(values.oldPassportNumber.trim())) issues.push(issue("oldPassportNumber", "Existing passport numbers normally use one letter followed by seven digits.", "मौजूदा पासपोर्ट नंबर में सामान्यतः एक अक्षर और सात अंक होते हैं।"));
  if (serviceId === "pan" && values.aadhaar && /^(\d)\1{11}$/.test(values.aadhaar.replace(/\s/g, ""))) issues.push(issue("aadhaar", "This Aadhaar entry repeats one digit throughout; verify it against the document.", "इस आधार प्रविष्टि में एक ही अंक दोहराया गया है; दस्तावेज़ से जाँचें।"));

  return issues;
}