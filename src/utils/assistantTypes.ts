import { z } from "zod";

export const assistantRequestSchema = z.object({
  question: z.string().trim().min(1).max(800),
  locale: z.enum(["en", "hi"]),
  serviceId: z.enum(["voter", "passport", "pan", "certificate", "scholarship"]),
  activeFieldId: z.string().trim().max(80).optional(),
  visibleFieldIds: z.array(z.string().trim().max(80)).max(30).default([]),
  completedFieldIds: z.array(z.string().trim().max(80)).max(30).default([]),
  completedDocumentIds: z.array(z.string().trim().max(80)).max(20).default([]),
});

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;

export type AssistantCitation = {
  id: string;
  label: string;
  url: string;
};

export type AssistantResponse = {
  answer: string;
  citations: AssistantCitation[];
  grounded: boolean;
  toolsUsed: string[];
};