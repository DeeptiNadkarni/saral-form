"use client";

import {
  Accessibility, AlertCircle, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown,
  Download, ExternalLink, FileCheck2, FileText, HelpCircle, Home,
  Info, Languages, LockKeyhole, MapPin, Moon, Pencil, Search, ShieldCheck, Sun, Trash2, UserRound, X,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import ApplicationReadiness, { type DocumentDetails } from "@/app/ApplicationReadiness";
import GuidanceAssistant from "@/app/GuidanceAssistant";
import { eligibilityEnhancements, getFieldEnhancement, serviceEnhancements } from "@/data/enhancements";
import { catalog, FieldGuide, formDefinitions, formPreviews, Locale } from "@/data/forms";
import { eligibilityQuestions, getConsistencyIssues, serviceInstructions } from "@/data/readiness";
import type { DocumentInspection } from "@/utils/documentInspection";
import { downloadPreparationSummary, type RedactionMode } from "@/utils/preparationSummary";
import { containsDevanagari, transliterateDevanagari } from "@/utils/transliteration";

type FormValues = Record<string, string>;
type FieldErrors = Record<string, string | undefined>;
type ServiceFilter = "all" | "drafts";
type AccessibilityPreferences = { largeText: boolean; highContrast: boolean; simpleLanguage: boolean };

const emptyValuesFor = (fields: FieldGuide[]): FormValues => Object.fromEntries(fields.map((field) => [field.id, ""]));
const storageKeyFor = (serviceId: string) => `saral-form:${serviceId}-draft`;

const copy = {
  en: {
    brand: "Saral Form", tagline: "Government forms, made understandable", offline: "Private demo · Form entries stay local",
    choose: "Services", demo: "Live demo", soon: "Coming soon", eyebrow: "Voter services · Form 6",
    title: "Register as a new voter", intro: "Prepare the right information and documents before applying on the official portal.",
    stepNames: ["Choose service", "Enter information", "Review answers", "Official portal"], progress: "Your information", fieldHelp: "Why this is asked", find: "Where to find it",
    serviceSelected: "Selected service",
    workflow: "Application steps", showSteps: "Show all steps", closeSteps: "Close steps", stepComplete: "Completed", stepCurrent: "You are here", stepUpcoming: "Upcoming",
    owner: "Who can provide it", docs: "Document checklist", docsIntro: "Based on the answers in this demo",
    special: "My situation", moved: "I recently moved to this address", tenant: "I live in rented accommodation",
    noAge: "I do not have a standard age document", added: "Added for your situation",
    moveDoc: "Previous voter details, if already enrolled elsewhere",
    rentDoc: "Registered rent deed or residence proof in a family member's name",
    ageDoc: "Declaration in the prescribed format with supporting evidence", sources: "Official sources",
    sourceNote: "Guidance is linked to primary government sources. Verify current rules before submission.",
    previous: "Clear form", review: "Review answers", saved: "Saved locally in this browser", required: "This field is required.",
    invalidMobile: "Enter a valid 10-digit mobile number.", ageError: "You must be at least 18 years old.", invalidPan: "Enter a valid PAN such as ABCDE1234F.", invalidAadhaar: "Enter a valid 12-digit Aadhaar number.",
    invalidPin: "Enter a valid 6-digit Indian PIN code.", invalidIfsc: "Enter a valid IFSC such as SBIN0001234.", invalidNumber: "Enter numbers only.",
    fixErrors: "Check the highlighted fields before continuing.", reviewTitle: "Review your answers", reviewIntro: "Confirm these details before continuing to the official portal.",
    edit: "Edit answers", continueOfficial: "Continue to official portal", ready: "Ready for the official portal", clearConfirm: "Clear all saved answers?",
    completed: "fields complete", notProvided: "Not provided", close: "Close review",
    selectedSoon: "This workflow is being prepared. Try the voter registration demo today.",
    closeHelp: "Close field help",
    aboutForm: "Why this form asks",
    asksNote: "These details come from the information requested by the government service.",
    visualPreview: "Form preview",
    previewNote: "Simplified non-editable view · Check the official form before submitting",
    officialReference: "View official reference",
    downloadSummary: "Download preparation PDF", generatingSummary: "Creating PDF…", summaryError: "The PDF could not be created. Please try again.",
    searchServices: "Search services", allServices: "All", draftsOnly: "Drafts", draft: "Draft", recent: "Recent",
    accessibility: "Accessibility", largerText: "Larger text", highContrast: "High contrast", simpleLanguage: "Simpler guidance", darkMode: "Use dark mode", lightMode: "Use light mode",
    example: "Example", officialSection: "Official form section", privacy: "Privacy", requiredLabel: "Required",
    optionalLabel: "Optional", latinSuggestion: "Latin-script suggestion", useSuggestion: "Use suggestion", transliterationNote: "Check spelling against your documents before using it.",
    sourceChecked: "Source checked", serviceChanged: "Service changed to", draftRestored: "Local draft restored",
    pdfPrivacy: "PDF privacy", redactNone: "Show all values", redactSensitive: "Mask sensitive values", redactPersonal: "Mask personal and sensitive values", includeQr: "Include official portal QR code",
    linkStatus: "Open links to verify current availability", linkCaveat: "Not live monitored",
  },
  hi: {
    brand: "सरल फॉर्म", tagline: "सरकारी फॉर्म, आसान भाषा में", offline: "निजी डेमो · फॉर्म प्रविष्टियाँ स्थानीय रहती हैं",
    choose: "सेवाएँ", demo: "लाइव डेमो", soon: "जल्द उपलब्ध", eyebrow: "मतदाता सेवाएँ · फॉर्म 6",
    title: "नए मतदाता के रूप में पंजीकरण", intro: "आधिकारिक पोर्टल पर आवेदन से पहले सही जानकारी और दस्तावेज़ तैयार करें।",
    stepNames: ["सेवा चुनें", "जानकारी भरें", "उत्तर जाँचें", "आधिकारिक पोर्टल"], progress: "आपकी जानकारी", fieldHelp: "यह क्यों पूछा जाता है", find: "यह कहाँ मिलेगा",
    serviceSelected: "चुनी गई सेवा",
    workflow: "आवेदन के चरण", showSteps: "सभी चरण दिखाएँ", closeSteps: "चरण बंद करें", stepComplete: "पूरा हुआ", stepCurrent: "आप यहाँ हैं", stepUpcoming: "आगे",
    owner: "कौन दे सकता है", docs: "दस्तावेज़ सूची", docsIntro: "इस डेमो में आपके उत्तरों के आधार पर",
    special: "मेरी स्थिति", moved: "मैं हाल ही में इस पते पर आया/आई हूँ", tenant: "मैं किराए के घर में रहता/रहती हूँ",
    noAge: "मेरे पास सामान्य आयु दस्तावेज़ नहीं है", added: "आपकी स्थिति के लिए जोड़ा गया",
    moveDoc: "यदि पहले कहीं पंजीकृत हैं तो पिछला मतदाता विवरण",
    rentDoc: "पंजीकृत किराया विलेख या परिवार सदस्य के नाम का निवास प्रमाण",
    ageDoc: "निर्धारित प्रारूप में घोषणा और सहायक प्रमाण", sources: "आधिकारिक स्रोत",
    sourceNote: "मार्गदर्शन प्राथमिक सरकारी स्रोतों से जुड़ा है। जमा करने से पहले वर्तमान नियम जाँचें।",
    previous: "फॉर्म साफ़ करें", review: "उत्तर जाँचें", saved: "इस ब्राउज़र में स्थानीय रूप से सहेजा गया", required: "यह जानकारी आवश्यक है।",
    invalidMobile: "मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।", ageError: "आपकी आयु कम से कम 18 वर्ष होनी चाहिए।", invalidPan: "ABCDE1234F जैसा मान्य पैन दर्ज करें।", invalidAadhaar: "मान्य 12 अंकों का आधार नंबर दर्ज करें।",
    invalidPin: "मान्य 6 अंकों का भारतीय पिन कोड दर्ज करें।", invalidIfsc: "SBIN0001234 जैसा मान्य IFSC दर्ज करें।", invalidNumber: "केवल अंक दर्ज करें।",
    fixErrors: "आगे बढ़ने से पहले चिह्नित जानकारी जाँचें।", reviewTitle: "अपने उत्तर जाँचें", reviewIntro: "आधिकारिक पोर्टल पर जाने से पहले इन विवरणों की पुष्टि करें।",
    edit: "उत्तर बदलें", continueOfficial: "आधिकारिक पोर्टल पर जाएँ", ready: "आधिकारिक पोर्टल के लिए तैयार", clearConfirm: "सभी सहेजे गए उत्तर हटाएँ?",
    completed: "जानकारी पूरी", notProvided: "नहीं दिया गया", close: "समीक्षा बंद करें",
    selectedSoon: "यह प्रक्रिया तैयार की जा रही है। अभी मतदाता पंजीकरण डेमो आज़माएँ।",
    closeHelp: "फ़ील्ड सहायता बंद करें",
    aboutForm: "यह फॉर्म क्यों पूछता है",
    asksNote: "ये विवरण सरकारी सेवा द्वारा माँगी गई जानकारी पर आधारित हैं।",
    visualPreview: "फॉर्म पूर्वावलोकन",
    previewNote: "सरल गैर-संपादन योग्य दृश्य · जमा करने से पहले आधिकारिक फॉर्म जाँचें",
    officialReference: "आधिकारिक संदर्भ देखें",
    downloadSummary: "तैयारी PDF डाउनलोड करें", generatingSummary: "PDF बन रही है…", summaryError: "PDF नहीं बन सकी। कृपया फिर प्रयास करें।",
    searchServices: "सेवाएँ खोजें", allServices: "सभी", draftsOnly: "ड्राफ्ट", draft: "ड्राफ्ट", recent: "हाल का",
    accessibility: "पहुँच विकल्प", largerText: "बड़ा टेक्स्ट", highContrast: "उच्च कंट्रास्ट", simpleLanguage: "सरल मार्गदर्शन", darkMode: "डार्क मोड उपयोग करें", lightMode: "लाइट मोड उपयोग करें",
    example: "उदाहरण", officialSection: "आधिकारिक फॉर्म अनुभाग", privacy: "गोपनीयता", requiredLabel: "आवश्यक",
    optionalLabel: "वैकल्पिक", latinSuggestion: "लैटिन लिपि सुझाव", useSuggestion: "सुझाव उपयोग करें", transliterationNote: "उपयोग से पहले दस्तावेज़ों से वर्तनी जाँचें।",
    sourceChecked: "स्रोत जाँचा गया", serviceChanged: "सेवा बदली गई", draftRestored: "स्थानीय ड्राफ्ट बहाल हुआ",
    pdfPrivacy: "PDF गोपनीयता", redactNone: "सभी मान दिखाएँ", redactSensitive: "संवेदनशील मान छिपाएँ", redactPersonal: "व्यक्तिगत और संवेदनशील मान छिपाएँ", includeQr: "आधिकारिक पोर्टल QR कोड शामिल करें",
    linkStatus: "वर्तमान उपलब्धता जाँचने के लिए लिंक खोलें", linkCaveat: "लाइव निगरानी नहीं होती",
  },
};

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [selectedService, setSelectedService] = useState("voter");
  const [activeField, setActiveField] = useState(formDefinitions.voter.fields[0].id);
  const [openHelpField, setOpenHelpField] = useState<string | null>(null);
  const [situations, setSituations] = useState({ moved: false, tenant: true, noAge: false });
  const [completedDocs, setCompletedDocs] = useState<string[]>(["photo"]);
  const [values, setValues] = useState<FormValues>(() => emptyValuesFor(formDefinitions.voter.fields));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [reviewing, setReviewing] = useState(false);
  const [handoffStarted, setHandoffStarted] = useState(false);
  const [stepPickerOpen, setStepPickerOpen] = useState(false);
  const [eligibilityAnswers, setEligibilityAnswers] = useState<Record<string, boolean | undefined>>({});
  const [documentInspections, setDocumentInspections] = useState<Record<string, DocumentInspection>>({});
  const [documentDetails, setDocumentDetails] = useState<Record<string, DocumentDetails>>({});
  const [eligibilityError, setEligibilityError] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [restored, setRestored] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [serviceQuery, setServiceQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("all");
  const [draftProgress, setDraftProgress] = useState<Record<string, number>>({});
  const [recentService, setRecentService] = useState<string | null>(null);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [accessibility, setAccessibility] = useState<AccessibilityPreferences>({ largeText: false, highContrast: false, simpleLanguage: false });
  const [darkMode, setDarkMode] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [sameAsFields, setSameAsFields] = useState<Record<string, boolean>>({});
  const [redactionMode, setRedactionMode] = useState<RedactionMode>("sensitive");
  const [includeQr, setIncludeQr] = useState(true);
  const t = copy[locale];
  const currentForm = formDefinitions[selectedService];
  const currentPreview = formPreviews[selectedService];
  const visibleFields = currentForm.fields.filter((field) => !field.showWhen || values[field.showWhen.fieldId] === field.showWhen.value);
  const visibleDocuments = currentForm.documents.filter((document) => !document.showWhen || values[document.showWhen.fieldId] === document.showWhen.value);
  const currentEligibility = eligibilityQuestions[selectedService];
  const consistencyIssues = getConsistencyIssues(selectedService, values);
  const currentField = visibleFields.find((field) => field.id === activeField) ?? visibleFields[0];
  const completeCount = visibleFields.filter((field) => values[field.id]?.trim()).length;
  const workflowStep = handoffStarted ? 4 : reviewing ? 3 : 2;
  const selectedServiceLabel = catalog.find((service) => service.id === selectedService)?.title[locale] ?? currentForm.title[locale];
  const serviceEnhancement = serviceEnhancements[selectedService];
  const fieldEnhancement = getFieldEnhancement(selectedService, currentField.id);
  const filteredCatalog = catalog.filter((service) => {
    const searchText = `${service.title.en} ${service.title.hi} ${service.detail.en} ${service.detail.hi}`.toLocaleLowerCase();
    return searchText.includes(serviceQuery.trim().toLocaleLowerCase()) && (serviceFilter === "all" || Boolean(draftProgress[service.id]));
  });
  const toggleDocument = (id: string) => setCompletedDocs((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  useEffect(() => {
    const restoreDraft = window.setTimeout(() => {
      const emptyValues = emptyValuesFor(formDefinitions[selectedService].fields);
      const storageKey = storageKeyFor(selectedService);
      try {
        const draft = localStorage.getItem(storageKey);
        if (draft) {
          const parsed = JSON.parse(draft);
          setValues({ ...emptyValues, ...parsed.values });
          setSituations(parsed.situations ?? { moved: false, tenant: true, noAge: false });
          setCompletedDocs(parsed.completedDocs ?? []);
          setEligibilityAnswers(parsed.eligibilityAnswers ?? {});
          setDocumentInspections(parsed.documentInspections ?? {});
          setDocumentDetails(parsed.documentDetails ?? {});
        } else {
          setValues(emptyValues);
          setSituations({ moved: false, tenant: selectedService === "voter", noAge: false });
          setCompletedDocs(selectedService === "voter" ? ["photo"] : []);
          setEligibilityAnswers({});
          setDocumentInspections({});
          setDocumentDetails({});
        }
      } catch {
        localStorage.removeItem(storageKey);
        setValues(emptyValues);
      }
      setActiveField(formDefinitions[selectedService].fields[0].id);
      setOpenHelpField(null);
      setErrors({});
      setEligibilityError(false);
      setRestored(true);
    }, 0);
    return () => window.clearTimeout(restoreDraft);
  }, [selectedService]);

  useEffect(() => {
    if (restored) localStorage.setItem(storageKeyFor(selectedService), JSON.stringify({ values, situations, completedDocs, eligibilityAnswers, documentInspections, documentDetails }));
  }, [completedDocs, documentDetails, documentInspections, eligibilityAnswers, restored, selectedService, situations, values]);

  useEffect(() => {
    const showPreview = window.setTimeout(() => setPreviewReady(true), 0);
    return () => window.clearTimeout(showPreview);
  }, []);

  useEffect(() => {
    const restoreTheme = window.setTimeout(() => {
      const storedTheme = localStorage.getItem("saral-form:theme");
      setDarkMode(storedTheme ? storedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
      setThemeReady(true);
    }, 0);
    return () => window.clearTimeout(restoreTheme);
  }, []);

  useEffect(() => {
    const discoverLocalState = window.setTimeout(() => {
      const progress: Record<string, number> = {};
      catalog.forEach((service) => {
        try {
          const draft = localStorage.getItem(storageKeyFor(service.id));
          if (!draft) return;
          const parsed = JSON.parse(draft) as { values?: FormValues };
          const completed = Object.values(parsed.values ?? {}).filter((value) => value?.trim()).length;
          if (completed) progress[service.id] = completed;
        } catch { /* Ignore an unreadable local draft. */ }
      });
      setDraftProgress(progress);
      setRecentService(localStorage.getItem("saral-form:recent-service"));
      try {
        const storedPreferences = localStorage.getItem("saral-form:accessibility");
        if (storedPreferences) setAccessibility(JSON.parse(storedPreferences));
      } catch { /* Keep accessible defaults if preferences are unreadable. */ }
    }, 0);
    return () => window.clearTimeout(discoverLocalState);
  }, [values]);

  useEffect(() => {
    localStorage.setItem("saral-form:accessibility", JSON.stringify(accessibility));
  }, [accessibility]);

  useEffect(() => {
    if (themeReady) localStorage.setItem("saral-form:theme", darkMode ? "dark" : "light");
  }, [darkMode, themeReady]);

  const selectService = (serviceId: string) => {
    if (serviceId === selectedService) return;
    setRestored(false);
    setReviewing(false);
    setHandoffStarted(false);
    setStepPickerOpen(false);
    setSelectedService(serviceId);
    localStorage.setItem("saral-form:recent-service", serviceId);
    setRecentService(serviceId);
    setAnnouncement(`${t.serviceChanged} ${catalog.find((service) => service.id === serviceId)?.title[locale] ?? serviceId}`);
  };

  const updateValue = (fieldId: string, value: string) => {
    setValues((current) => {
      const next = { ...current, [fieldId]: value };
      currentForm.fields.forEach((field) => {
        if (field.sameAs?.fieldId === fieldId && sameAsFields[field.id]) next[field.id] = value;
      });
      return next;
    });
    setErrors((current) => {
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  };

  const toggleSameAs = (field: FieldGuide, checked: boolean) => {
    setSameAsFields((current) => ({ ...current, [field.id]: checked }));
    updateValue(field.id, checked && field.sameAs ? values[field.sameAs.fieldId] ?? "" : "");
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};
    visibleFields.forEach((field) => {
      const value = values[field.id]?.trim() ?? "";
      if (field.required !== false && !value) nextErrors[field.id] = t.required;
      if (field.validation === "mobile" && value && !/^\d{10}$/.test(value.replace(/\s/g, ""))) nextErrors[field.id] = t.invalidMobile;
      if (field.validation === "pan" && value && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.toUpperCase())) nextErrors[field.id] = t.invalidPan;
      if (field.validation === "aadhaar" && value && !/^\d{12}$/.test(value.replace(/\s/g, ""))) nextErrors[field.id] = t.invalidAadhaar;
      if (field.validation === "pin" && value && !/^[1-9]\d{5}$/.test(value.replace(/\s/g, ""))) nextErrors[field.id] = t.invalidPin;
      if (field.validation === "ifsc" && value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase().replace(/\s/g, ""))) nextErrors[field.id] = t.invalidIfsc;
      if (field.validation === "number" && value && !/^\d+$/.test(value.replace(/[,.\s]/g, ""))) nextErrors[field.id] = t.invalidNumber;
      if (field.validation === "adult" && value) {
        const latestEligibleDate = new Date();
        latestEligibleDate.setFullYear(latestEligibleDate.getFullYear() - 18);
        if (new Date(`${value}T00:00:00`) > latestEligibleDate) nextErrors[field.id] = t.ageError;
      }
    });
    setErrors(nextErrors);
    return nextErrors;
  };

  const handleReview = (event: FormEvent) => {
    event.preventDefault();
    const eligible = currentEligibility.every((question) => {
      const answer = eligibilityAnswers[question.id];
      const severity = eligibilityEnhancements[selectedService]?.[question.id]?.severity ?? "blocker";
      return answer !== undefined && (severity !== "blocker" || answer === question.expected);
    });
    setEligibilityError(!eligible);
    if (!eligible) {
      document.getElementById("readiness-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const nextErrors = validate();
    const firstInvalid = visibleFields.find((field) => nextErrors[field.id]);
    if (firstInvalid) {
      setActiveField(firstInvalid.id);
      document.getElementById(firstInvalid.id)?.focus();
      return;
    }
    setReviewing(true);
  };

  const clearForm = () => {
    if (!window.confirm(t.clearConfirm)) return;
    setValues(emptyValuesFor(currentForm.fields));
    setErrors({});
    setSituations({ moved: false, tenant: false, noAge: false });
    setCompletedDocs([]);
    setEligibilityAnswers({});
    setDocumentInspections({});
    setDocumentDetails({});
    setEligibilityError(false);
    localStorage.removeItem(storageKeyFor(selectedService));
  };

  const handleDownloadSummary = async () => {
    setGeneratingSummary(true);
    try {
      await downloadPreparationSummary({ locale, serviceId: selectedService, form: currentForm, fields: visibleFields, values, documents: visibleDocuments, completedDocs, inspections: documentInspections, eligibility: currentEligibility, eligibilityAnswers, issues: consistencyIssues, instructions: serviceInstructions[selectedService], redactionMode, includeQr });
    } catch {
      window.alert(t.summaryError);
    } finally {
      setGeneratingSummary(false);
    }
  };

  return (
    <div className={`app-shell ${darkMode ? "dark-mode" : ""} ${accessibility.largeText ? "large-text" : ""} ${accessibility.highContrast ? "high-contrast" : ""}`} lang={locale}>
      <a className="skip-link" href="#main-content">{locale === "en" ? "Skip to form" : "फॉर्म पर जाएँ"}</a>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
      <header className="topbar">
        <a className="brand" href="#top" aria-label={t.brand}>
          <span className="brand-mark"><FileText size={22} strokeWidth={2.2} /></span>
          <span><strong>{t.brand}</strong><small>{t.tagline}</small></span>
        </a>
        <div className="header-actions">
          <span className="privacy-pill"><LockKeyhole size={14} /> {t.offline}</span>
          <button className="language-button" onClick={() => setLocale(locale === "en" ? "hi" : "en")}><Languages size={17} /> {locale === "en" ? "हिंदी" : "English"}</button>
          <button className="icon-button" title={darkMode ? t.lightMode : t.darkMode} aria-label={darkMode ? t.lightMode : t.darkMode} aria-pressed={darkMode} onClick={() => setDarkMode((enabled) => !enabled)}>{darkMode ? <Sun size={19} /> : <Moon size={19} />}</button>
          <div className="accessibility-wrap">
            <button className="icon-button" title={t.accessibility} aria-label={t.accessibility} aria-expanded={accessibilityOpen} aria-controls="accessibility-menu" onClick={() => setAccessibilityOpen((open) => !open)}><Accessibility size={22} /></button>
            {accessibilityOpen && <section className="accessibility-menu" id="accessibility-menu" aria-label={t.accessibility}><strong>{t.accessibility}</strong>
              {([['largeText', t.largerText], ['highContrast', t.highContrast], ['simpleLanguage', t.simpleLanguage]] as const).map(([key, label]) => <label key={key}><span>{label}</span><input type="checkbox" checked={accessibility[key]} onChange={() => setAccessibility((current) => ({ ...current, [key]: !current[key] }))} /></label>)}
            </section>}
          </div>
        </div>
      </header>

      <div className="workspace" id="top">
        <aside className="service-nav" aria-label={t.choose}>
          <div className="nav-heading"><span>{t.choose}</span><span className="service-count">05</span></div>
          <div className="service-tools">
            <label><Search size={14} /><span className="sr-only">{t.searchServices}</span><input type="search" value={serviceQuery} onChange={(event) => setServiceQuery(event.target.value)} placeholder={t.searchServices} /></label>
            <div className="service-filters" role="group" aria-label={t.choose}><button className={serviceFilter === "all" ? "active" : ""} onClick={() => setServiceFilter("all")}>{t.allServices}</button><button className={serviceFilter === "drafts" ? "active" : ""} onClick={() => setServiceFilter("drafts")}>{t.draftsOnly}</button></div>
          </div>
          <nav>
            {filteredCatalog.map((service) => {
              const index = catalog.findIndex((item) => item.id === service.id);
              return (
              <button key={service.id} className={`service-item ${selectedService === service.id ? "active" : ""}`} onClick={() => selectService(service.id)}>
                <span className="service-index">0{index + 1}</span>
                <span className="service-label"><strong>{service.title[locale]}</strong><small>{service.detail[locale]}</small><em>{draftProgress[service.id] ? `${t.draft} · ${draftProgress[service.id]}` : ""}{recentService === service.id ? `${draftProgress[service.id] ? " · " : ""}${t.recent}` : ""}</em></span>
                <span className={`status-dot ${service.status}`} title={service.status === "demo" ? t.demo : t.soon} />
              </button>
            )})}
          </nav>
          <div className="trust-note"><ShieldCheck size={20} /><p><strong>{locale === "en" ? "Official-source guidance" : "आधिकारिक स्रोत मार्गदर्शन"}</strong><span>{locale === "en" ? "You always submit on the government portal." : "आप हमेशा सरकारी पोर्टल पर जमा करते हैं।"}</span></p></div>
        </aside>

        <main className="main-content" id="main-content">
          <>
              <section className="page-intro">
                <div><p className="eyebrow"><span />{currentForm.eyebrow[locale]}</p><h1>{currentForm.title[locale]}</h1><p>{accessibility.simpleLanguage ? serviceEnhancement.simpleSummary[locale] : currentForm.intro[locale]}</p></div>
                <div className="progress-block">
                  <div className="progress-summary"><button type="button" className="step-picker-trigger" onClick={() => setStepPickerOpen((open) => !open)} aria-expanded={stepPickerOpen} aria-controls="workflow-steps" aria-label={t.showSteps}><strong>{locale === "en" ? `Step ${workflowStep} of 4` : `4 में से चरण ${workflowStep}`} · {t.stepNames[workflowStep - 1]}</strong><ChevronDown size={14} /></button><small>{completeCount}/{visibleFields.length} {t.completed}</small></div>
                  <div className="progress-track"><i style={{ width: `${workflowStep * 25}%` }} /></div>
                  <p className="step-context"><Check size={12} /> {t.serviceSelected}: {selectedServiceLabel}</p>
                  {stepPickerOpen && <section className="step-picker" id="workflow-steps" aria-label={t.workflow}>
                    <div className="step-picker-heading"><strong>{t.workflow}</strong><button type="button" onClick={() => setStepPickerOpen(false)} aria-label={t.closeSteps}><X size={15} /></button></div>
                    <ol>{t.stepNames.map((stepName, index) => {
                      const stepNumber = index + 1;
                      const status = stepNumber < workflowStep ? "complete" : stepNumber === workflowStep ? "current" : "upcoming";
                      const statusLabel = status === "complete" ? t.stepComplete : status === "current" ? t.stepCurrent : t.stepUpcoming;
                      return <li className={status} key={stepName} aria-current={status === "current" ? "step" : undefined}><i>{status === "complete" ? <Check size={13} /> : stepNumber}</i><div><strong>{stepName}</strong><small>{statusLabel}</small></div></li>;
                    })}</ol>
                  </section>}
                </div>
              </section>

              <section className="form-overview" aria-labelledby="form-overview-title">
                <div className="form-rationale">
                  <div className="panel-kicker"><Info size={17} /> {t.aboutForm}</div>
                  <h2 id="form-overview-title">{currentForm.title[locale]}</h2>
                  <p>{currentForm.reason[locale]}</p>
                  <div className="rationale-note"><FileCheck2 size={17} /><span>{t.asksNote}</span></div>
                </div>
                <div className="form-preview">
                  <div className="preview-toolbar"><span>{t.visualPreview}</span><i>{locale === "en" ? "NON-EDITABLE" : "केवल दृश्य"}</i></div>
                  <div className="preview-media">
                    {!previewReady ? <div className="preview-loading" aria-hidden="true" /> : currentPreview.kind === "pdf" ? <object data={`${currentPreview.url}#page=1&view=FitH&toolbar=0&navpanes=0`} type="application/pdf" aria-label={currentPreview.label[locale]}><a href={currentPreview.url} target="_blank">{currentPreview.label[locale]}</a></object> : <Image src={currentPreview.url} alt={currentPreview.label[locale]} width={1280} height={800} priority />}
                  </div>
                  <div className="preview-caption"><strong>{currentPreview.label[locale]}</strong><small>{currentPreview.note[locale]}</small></div>
                  <a href={currentPreview.sourceUrl} target="_blank" rel="noreferrer">{t.officialReference}<ExternalLink size={14} /></a>
                </div>
              </section>

              <ApplicationReadiness
                locale={locale}
                questions={currentEligibility}
                answers={eligibilityAnswers}
                onAnswer={(id, answer) => { setEligibilityAnswers((current) => ({ ...current, [id]: answer })); setEligibilityError(false); }}
                instructions={serviceInstructions[selectedService]}
                sourceUrl={currentForm.sources[0].url}
                issues={consistencyIssues}
                documents={visibleDocuments}
                inspections={documentInspections}
                onInspection={(id, inspection) => setDocumentInspections((current) => ({ ...current, [id]: inspection }))}
                onRemoveInspection={(id) => setDocumentInspections((current) => { const next = { ...current }; delete next[id]; return next; })}
                possessedDocuments={completedDocs}
                onTogglePossession={toggleDocument}
                documentDetails={documentDetails}
                onDocumentDetails={(id, details) => setDocumentDetails((current) => ({ ...current, [id]: details }))}
                formValues={values}
                eligibilityError={eligibilityError}
                serviceId={selectedService}
                serviceEnhancement={serviceEnhancement}
              />

              <div className="form-layout">
                <form className="form-panel" aria-label={t.progress} onSubmit={handleReview} noValidate>
                  {Object.values(errors).some(Boolean) && <div className="error-summary" role="alert"><AlertCircle size={17} /> {t.fixErrors}</div>}
                  {visibleFields.map((field, index) => (
                    <div className={`field-row ${activeField === field.id ? "focused" : ""} ${errors[field.id] ? "invalid" : ""}`} key={field.id} onFocus={() => setActiveField(field.id)}>
                      <label htmlFor={field.id}><span>{String(index + 1).padStart(2, "0")}</span>{field.label[locale]} <small className="required-marker">{field.required === false ? t.optionalLabel : t.requiredLabel}</small></label>
                      {field.type === "select" ? (
                        <div className="select-wrap"><select id={field.id} value={values[field.id] ?? ""} onChange={(event) => updateValue(field.id, event.target.value)} aria-invalid={Boolean(errors[field.id])} aria-describedby={errors[field.id] ? `${field.id}-error` : undefined}><option value="" disabled>{field.options?.[0][locale]}</option>{field.options?.slice(1).map((option) => <option key={option.en} value={option.en}>{option[locale]}</option>)}</select><ChevronDown size={17} /></div>
                      ) : field.type === "textarea" ? (
                        <textarea id={field.id} rows={3} placeholder={field.placeholder?.[locale]} value={values[field.id] ?? ""} onChange={(event) => updateValue(field.id, event.target.value)} aria-invalid={Boolean(errors[field.id])} aria-describedby={errors[field.id] ? `${field.id}-error` : undefined} />
                      ) : <input id={field.id} type={field.type} inputMode={["mobile", "aadhaar", "pin", "number"].includes(field.validation ?? "") ? "numeric" : undefined} placeholder={field.placeholder?.[locale]} value={values[field.id] ?? ""} onChange={(event) => updateValue(field.id, field.validation === "ifsc" ? event.target.value.toUpperCase() : event.target.value)} aria-invalid={Boolean(errors[field.id])} aria-describedby={errors[field.id] ? `${field.id}-error` : undefined} />}
                      {field.sameAs && <label className="same-as-control"><input type="checkbox" checked={Boolean(sameAsFields[field.id])} onChange={(event) => toggleSameAs(field, event.target.checked)} /> {field.sameAs.label[locale]}</label>}
                      {field.type !== "date" && containsDevanagari(values[field.id] ?? "") && <div className="transliteration-suggestion"><div><strong>{t.latinSuggestion}</strong><span>{transliterateDevanagari(values[field.id])}</span><small>{t.transliterationNote}</small></div><button type="button" onClick={() => updateValue(field.id, transliterateDevanagari(values[field.id]))}>{t.useSuggestion}</button></div>}
                      <button type="button" className="help-trigger" onClick={() => { setActiveField(field.id); setOpenHelpField((current) => current === field.id ? null : field.id); }} aria-label={`${t.fieldHelp}: ${field.label[locale]}`} aria-expanded={openHelpField === field.id} aria-controls={`${field.id}-help`}><HelpCircle size={17} /></button>
                      {errors[field.id] && <p className="field-error" id={`${field.id}-error`}><AlertCircle size={13} /> {errors[field.id]}</p>}
                      {openHelpField === field.id && <section className="field-help-popover" id={`${field.id}-help`} aria-label={`${t.fieldHelp}: ${field.label[locale]}`}>
                        <button type="button" className="field-help-close" onClick={() => setOpenHelpField(null)} aria-label={t.closeHelp}><X size={15} /></button>
                        <strong>{field.label[locale]}</strong>
                        <p>{field.hint[locale]}</p>
                        <dl>
                          <div><dt><MapPin size={14} /> {t.find}</dt><dd>{field.source[locale]}</dd></div>
                          <div><dt><UserRound size={14} /> {t.owner}</dt><dd>{field.owner[locale]}</dd></div>
                          <div><dt>{t.example}</dt><dd>{getFieldEnhancement(selectedService, field.id).examples[0][locale]}</dd></div>
                          <div><dt>{t.officialSection}</dt><dd>{getFieldEnhancement(selectedService, field.id).officialSection[locale]}</dd></div>
                          <div className="privacy-detail"><dt><LockKeyhole size={14} /> {t.privacy}</dt><dd>{getFieldEnhancement(selectedService, field.id).privacy[locale]}</dd></div>
                        </dl>
                      </section>}
                    </div>
                  ))}
                  <div className="local-save"><CheckCircle2 size={16} /> {t.saved}</div>
                  <div className="form-actions"><button className="secondary-button" type="button" onClick={clearForm}><Trash2 size={16} /> {t.previous}</button><button className="primary-button" type="submit">{t.review} <ArrowRight size={17} /></button></div>
                </form>

                <aside className="guidance-rail">
                  <section className="guide-panel">
                    <div className="panel-kicker"><BookOpen size={17} /> {t.fieldHelp}</div><h2>{currentField.label[locale]}</h2><p className="guide-answer">{currentField.hint[locale]}</p>
                    <div className="guide-meta"><MapPin size={17} /><p><span>{t.find}</span>{currentField.source[locale]}</p></div>
                    <div className="guide-meta"><UserRound size={17} /><p><span>{t.owner}</span>{currentField.owner[locale]}</p></div>
                    <div className="guide-meta"><Info size={17} /><p><span>{t.example}</span>{fieldEnhancement.examples[0][locale]}</p></div>
                    <div className="guide-meta"><LockKeyhole size={17} /><p><span>{t.privacy} · {fieldEnhancement.sensitivity}</span>{fieldEnhancement.privacy[locale]}</p></div>
                  </section>

                  <section className="checklist-panel">
                    <div className="section-heading"><div><span>{t.docs}</span><small>{t.docsIntro}</small></div><FileCheck2 size={21} /></div>
                    <div className="checklist">{visibleDocuments.map((doc) => (
                      <button key={doc.id} className={completedDocs.includes(doc.id) ? "checked" : ""} onClick={() => toggleDocument(doc.id)}><i>{completedDocs.includes(doc.id) && <Check size={14} />}</i><span><strong>{doc.title[locale]}</strong><small>{doc.note[locale]}</small></span></button>
                    ))}</div>
                    {selectedService === "voter" && <><div className="situation-title"><Info size={16} /> {t.special}</div>
                      {(["moved", "tenant", "noAge"] as const).map((key) => <label className="toggle-row" key={key}><span>{t[key]}</span><input type="checkbox" checked={situations[key]} onChange={() => setSituations({ ...situations, [key]: !situations[key] })} /><i /></label>)}
                      {Object.values(situations).some(Boolean) && <div className="conditional-docs"><span>{t.added}</span>{situations.moved && <p>+ {t.moveDoc}</p>}{situations.tenant && <p>+ {t.rentDoc}</p>}{situations.noAge && <p>+ {t.ageDoc}</p>}</div>}</>}
                  </section>

                  <section className="sources-panel">
                    <div className="section-heading"><div><span>{t.sources}</span><small>{t.sourceNote}</small></div><Home size={19} /></div>
                    <p className="source-status"><CheckCircle2 size={14} /> {t.sourceChecked}: <time dateTime={serviceEnhancement.verifiedOn}>{new Intl.DateTimeFormat(locale === "en" ? "en-IN" : "hi-IN", { dateStyle: "medium" }).format(new Date(`${serviceEnhancement.verifiedOn}T00:00:00`))}</time></p>
                    <p className="link-health manual"><i /> <span>{t.linkStatus}<small>{t.linkCaveat}</small></span></p>
                    {currentForm.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span>{source.title}</span><ExternalLink size={15} /></a>)}
                  </section>
                </aside>
              </div>
              {reviewing && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setReviewing(false)}>
                <section className="review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title">
                  <button className="dialog-close" onClick={() => setReviewing(false)} aria-label={t.close}><X size={20} /></button>
                  <div className="review-status-row">
                    <div className="review-status"><CheckCircle2 size={18} /> {t.ready}</div>
                    <button type="button" className="review-steps-trigger" onClick={() => setStepPickerOpen((open) => !open)} aria-expanded={stepPickerOpen} aria-controls="review-workflow-steps"><Info size={15} /> {t.showSteps}</button>
                  </div>
                  {stepPickerOpen && <section className="step-picker review-step-picker" id="review-workflow-steps" aria-label={t.workflow}>
                    <div className="step-picker-heading"><strong>{t.workflow}</strong><button type="button" onClick={() => setStepPickerOpen(false)} aria-label={t.closeSteps}><X size={15} /></button></div>
                    <ol>{t.stepNames.map((stepName, index) => {
                      const stepNumber = index + 1;
                      const status = stepNumber < workflowStep ? "complete" : stepNumber === workflowStep ? "current" : "upcoming";
                      const statusLabel = status === "complete" ? t.stepComplete : status === "current" ? t.stepCurrent : t.stepUpcoming;
                      return <li className={status} key={stepName} aria-current={status === "current" ? "step" : undefined}><i>{status === "complete" ? <Check size={13} /> : stepNumber}</i><div><strong>{stepName}</strong><small>{statusLabel}</small></div></li>;
                    })}</ol>
                  </section>}
                  <h2 id="review-title">{t.reviewTitle}</h2><p className="review-intro">{t.reviewIntro}</p>
                  <dl className="review-grid">{visibleFields.map((field) => <div key={field.id}><dt>{field.label[locale]}</dt><dd>{field.type === "select" ? field.options?.find((option) => option.en === values[field.id])?.[locale] : values[field.id] || t.notProvided}</dd></div>)}</dl>
                  <fieldset className="summary-options"><legend>{t.pdfPrivacy}</legend><div className="redaction-options">{([['none', t.redactNone], ['sensitive', t.redactSensitive], ['personal', t.redactPersonal]] as const).map(([mode, label]) => <label key={mode}><input type="radio" name="redaction" value={mode} checked={redactionMode === mode} onChange={() => setRedactionMode(mode)} /><span>{label}</span></label>)}</div><label className="qr-option"><input type="checkbox" checked={includeQr} onChange={(event) => setIncludeQr(event.target.checked)} /> {t.includeQr}</label></fieldset>
                  <div className="review-actions"><button className="secondary-button" onClick={() => { setReviewing(false); setHandoffStarted(false); }}><Pencil size={16} /> {t.edit}</button><button className="secondary-button" onClick={handleDownloadSummary} disabled={generatingSummary}><Download size={16} /> {generatingSummary ? t.generatingSummary : t.downloadSummary}</button><a className="primary-button" href={currentForm.portalUrl} target="_blank" rel="noreferrer" onClick={() => setHandoffStarted(true)}>{t.continueOfficial} <ExternalLink size={16} /></a></div>
                </section>
              </div>}
            </>
        </main>
      </div>
      <GuidanceAssistant key={currentForm.id} locale={locale} form={currentForm} activeField={currentField} visibleFields={visibleFields} values={values} completedDocs={completedDocs} />
    </div>
  );
}