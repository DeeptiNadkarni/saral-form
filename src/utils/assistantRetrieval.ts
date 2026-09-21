import { serviceEnhancements } from "@/data/enhancements";
import { formDefinitions, type FormDefinition, type LocalizedText } from "@/data/forms";
import { eligibilityQuestions, serviceInstructions } from "@/data/readiness";
import type { AssistantCitation } from "@/utils/assistantTypes";

export type GuidanceChunk = {
  id: string;
  serviceId: string;
  kind: "overview" | "field" | "document" | "eligibility" | "instruction";
  title: LocalizedText;
  content: LocalizedText;
  citation: AssistantCitation;
};

const instructionLabels: Record<keyof typeof serviceInstructions.voter, LocalizedText> = {
  fee: { en: "Fees", hi: "शुल्क" },
  timing: { en: "Processing time", hi: "प्रसंस्करण समय" },
  submission: { en: "How to submit", hi: "जमा करने का तरीका" },
  deadline: { en: "Deadlines", hi: "समय सीमा" },
};

const normalizeEndpoint = (url: string) => url;

function citationFor(form: FormDefinition, id: string): AssistantCitation {
  const source = form.sources[0];
  return {
    id: `${form.id}-${id}`,
    label: source?.title ?? form.title.en,
    url: normalizeEndpoint(source?.url ?? form.portalUrl),
  };
}

function buildServiceChunks(serviceId: string): GuidanceChunk[] {
  const form = formDefinitions[serviceId];
  const instructions = serviceInstructions[serviceId];
  const enhancement = serviceEnhancements[serviceId];
  if (!form || !instructions || !enhancement) return [];

  const chunks: GuidanceChunk[] = [
    {
      id: `${serviceId}-overview`,
      serviceId,
      kind: "overview",
      title: form.title,
      content: {
        en: `${form.intro.en} ${form.reason.en} ${enhancement.simpleSummary.en} Appointment: ${enhancement.appointment.en} Expedited service: ${enhancement.expedited.en} Verified ${enhancement.verifiedOn}.`,
        hi: `${form.intro.hi} ${form.reason.hi} ${enhancement.simpleSummary.hi} अपॉइंटमेंट: ${enhancement.appointment.hi} त्वरित सेवा: ${enhancement.expedited.hi} सत्यापन ${enhancement.verifiedOn}।`,
      },
      citation: citationFor(form, "overview"),
    },
  ];

  for (const [kind, content] of Object.entries(instructions) as [keyof typeof instructions, LocalizedText][]) {
    chunks.push({
      id: `${serviceId}-instruction-${kind}`,
      serviceId,
      kind: "instruction",
      title: instructionLabels[kind],
      content,
      citation: citationFor(form, `instruction-${kind}`),
    });
  }

  for (const field of form.fields) {
    chunks.push({
      id: `${serviceId}-field-${field.id}`,
      serviceId,
      kind: "field",
      title: field.label,
      content: {
        en: `${field.hint.en} Source: ${field.source.en}. Information owner: ${field.owner.en}.`,
        hi: `${field.hint.hi} स्रोत: ${field.source.hi}। जानकारी का स्वामी: ${field.owner.hi}।`,
      },
      citation: citationFor(form, `field-${field.id}`),
    });
  }

  for (const document of form.documents) {
    chunks.push({
      id: `${serviceId}-document-${document.id}`,
      serviceId,
      kind: "document",
      title: document.title,
      content: document.note,
      citation: citationFor(form, `document-${document.id}`),
    });
  }

  for (const question of eligibilityQuestions[serviceId] ?? []) {
    chunks.push({
      id: `${serviceId}-eligibility-${question.id}`,
      serviceId,
      kind: "eligibility",
      title: question.prompt,
      content: question.failMessage,
      citation: citationFor(form, `eligibility-${question.id}`),
    });
  }

  return chunks;
}

const corpus = Object.keys(formDefinitions).flatMap(buildServiceChunks);

function terms(value: string): string[] {
  return value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function searchOfficialGuidance(serviceId: string, query: string, limit = 5): GuidanceChunk[] {
  const queryTerms = new Set(terms(query));
  const serviceChunks = corpus.filter((chunk) => chunk.serviceId === serviceId);
  if (queryTerms.size === 0) return serviceChunks.slice(0, limit);

  return serviceChunks
    .map((chunk) => {
      const titleTerms = terms(`${chunk.title.en} ${chunk.title.hi}`);
      const contentTerms = terms(`${chunk.content.en} ${chunk.content.hi} ${chunk.kind}`);
      const titleScore = titleTerms.reduce((score, term) => score + (queryTerms.has(term) ? 4 : 0), 0);
      const contentScore = contentTerms.reduce((score, term) => score + (queryTerms.has(term) ? 1 : 0), 0);
      return { chunk, score: titleScore + contentScore };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ chunk }) => chunk);
}

export function getFormContext(serviceId: string) {
  const form = formDefinitions[serviceId];
  if (!form) return null;
  return {
    serviceId,
    title: form.title,
    fields: form.fields.map(({ id, label, required, showWhen }) => ({ id, label, required: required !== false, showWhen })),
    documents: form.documents.map(({ id, title, showWhen }) => ({ id, title, showWhen })),
    officialSources: form.sources,
    portalUrl: form.portalUrl,
  };
}