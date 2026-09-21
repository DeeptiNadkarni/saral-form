"use client";

import { ExternalLink, LoaderCircle, LockKeyhole, MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { FieldGuide, FormDefinition, Locale } from "@/data/forms";
import type { AssistantCitation, AssistantResponse } from "@/utils/assistantTypes";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  citations?: AssistantCitation[];
  grounded?: boolean;
  retryPrompt?: string;
};

type GuidanceAssistantProps = {
  locale: Locale;
  form: FormDefinition;
  activeField: FieldGuide;
  visibleFields: FieldGuide[];
  values: Record<string, string>;
  completedDocs: string[];
};

const assistantCopy = {
  en: {
    open: "Ask Saral", close: "Close Ask Saral", title: "Ask Saral", status: "AI guidance · official sources",
    welcome: "Ask about this form, its fields, documents, fees, or your next preparation step.",
    placeholder: "Ask about this form…", send: "Send question", source: "Official source", loading: "Checking approved guidance…",
    error: "I could not reach the guidance model. Try again.", retry: "Retry", ungrounded: "Not enough verified information",
    privacy: "Your question and completion status are sent to the configured AI model. Entered form values stay in this browser.",
    suggestions: ["What should I do next?", "Which documents do I need?", "Is there a fee?"],
  },
  hi: {
    open: "सरल से पूछें", close: "सरल सहायक बंद करें", title: "सरल से पूछें", status: "AI मार्गदर्शन · आधिकारिक स्रोत",
    welcome: "इस फॉर्म, जानकारी, दस्तावेज़, शुल्क या अगले तैयारी चरण के बारे में पूछें।",
    placeholder: "इस फॉर्म के बारे में पूछें…", send: "प्रश्न भेजें", source: "आधिकारिक स्रोत", loading: "स्वीकृत मार्गदर्शन जाँचा जा रहा है…",
    error: "मार्गदर्शन मॉडल से संपर्क नहीं हो सका। फिर प्रयास करें।", retry: "फिर प्रयास करें", ungrounded: "पर्याप्त सत्यापित जानकारी नहीं मिली",
    privacy: "आपका प्रश्न और पूर्णता स्थिति कॉन्फ़िगर किए गए AI मॉडल को भेजे जाते हैं। भरे गए फॉर्म मान इसी ब्राउज़र में रहते हैं।",
    suggestions: ["अब मुझे क्या करना चाहिए?", "कौन से दस्तावेज़ चाहिए?", "क्या कोई शुल्क है?"],
  },
};

export default function GuidanceAssistant({ locale, form, activeField, visibleFields, values, completedDocs }: GuidanceAssistantProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextMessageId = useRef(0);
  const t = assistantCopy[locale];

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const ask = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;
    const id = nextMessageId.current;
    nextMessageId.current += 2;
    setMessages((current) => [...current, { id, role: "user", text: trimmed }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          locale,
          serviceId: form.id,
          activeFieldId: activeField.id,
          visibleFieldIds: visibleFields.map((field) => field.id),
          completedFieldIds: visibleFields.filter((field) => Boolean(values[field.id]?.trim())).map((field) => field.id),
          completedDocumentIds: completedDocs,
        }),
      });
      const payload = await response.json() as AssistantResponse | { error?: string };
      if (!response.ok || !("answer" in payload)) throw new Error("Assistant request failed");
      setMessages((current) => [...current, {
        id: id + 1,
        role: "assistant",
        text: payload.answer,
        citations: payload.citations,
        grounded: payload.grounded,
      }]);
    } catch {
      setMessages((current) => [...current, { id: id + 1, role: "assistant", text: t.error, grounded: false, retryPrompt: trimmed }]);
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(question);
  };

  return <>
    <button type="button" className="assistant-launcher" onClick={() => setOpen(true)} aria-label={t.open} aria-expanded={open} aria-controls="guidance-assistant"><Sparkles size={18} /><span>{t.open}</span></button>
    {open && <aside className="assistant-panel" id="guidance-assistant" role="dialog" aria-modal="false" aria-labelledby="assistant-title">
      <header className="assistant-header">
        <div><span><MessageCircle size={18} /></span><div><strong id="assistant-title">{t.title}</strong><small>{t.status}</small></div></div>
        <button type="button" onClick={() => setOpen(false)} aria-label={t.close}><X size={18} /></button>
      </header>
      <div className="assistant-messages" aria-live="polite">
        <div className="assistant-message assistant"><p>{t.welcome}</p></div>
        {messages.map((message) => <div className={`assistant-message ${message.role}`} key={message.id}>
          <p>{message.text}</p>
          {message.grounded === false && <small className="assistant-grounding">{t.ungrounded}</small>}
          {message.citations?.map((citation) => <a href={citation.url} target="_blank" rel="noreferrer" key={citation.id}><ExternalLink size={11} /> {t.source}: {citation.label}</a>)}
          {message.retryPrompt && <button type="button" className="assistant-retry" onClick={() => ask(message.retryPrompt!)}><RotateCcw size={12} /> {t.retry}</button>}
        </div>)}
        {loading && <div className="assistant-message assistant assistant-loading"><LoaderCircle size={15} /><p>{t.loading}</p></div>}
      </div>
      {messages.length === 0 && <div className="assistant-suggestions">{t.suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => ask(suggestion)}>{suggestion}</button>)}</div>}
      <form className="assistant-input" onSubmit={submit}>
        <input ref={inputRef} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={t.placeholder} aria-label={t.placeholder} />
        <button type="submit" disabled={!question.trim() || loading} aria-label={t.send}><Send size={17} /></button>
      </form>
      <p className="assistant-privacy"><LockKeyhole size={12} /> {t.privacy}</p>
    </aside>}
  </>;
}