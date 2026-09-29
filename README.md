# Saral Form

Saral Form is a bilingual English/Hindi assistant for understanding and preparing Indian government applications. It explains questions, tracks readiness, identifies required documents, and directs users to the appropriate official portal for final submission.

**Live website:** [https://app-saral-form-dev-7d3f.azurewebsites.net](https://app-saral-form-dev-7d3f.azurewebsites.net)

Saral Form is a preparation service, not a government portal. It does not submit applications, approve eligibility, make payments, book appointments, or modify government records.

## Supported services

- Voter registration through Form 6
- Fresh and re-issued passport preparation
- New PAN applications and PAN corrections
- Income, caste, and domicile certificate preparation
- National scholarship application preparation

## Features

- Guided bilingual forms with eligibility and readiness checks
- Grounded bilingual AI assistant backed by approved guidance and official links
- Automatic browser-local OCR for PDF, JPG, and PNG documents
- PDF OCR for up to 10 pages with page-separated text previews
- Local comparison of extracted text with prepared form values
- No document uploads to the server; OCR runs entirely in the browser
- Printable summaries, QR handoff, and links to official submission portals

## Grounded assistant

Ask Saral uses the Azure OpenAI Responses API and the `gpt-5.4-mini` deployment. The model can call only three bounded, read-only tools:

- `search_official_guidance`
- `get_form_context`
- `check_preparation_status`

The browser sends the question, selected service, field and document IDs, and completion state. It does not send entered form values. Responses use `store: false`; unsupported answers are marked as not grounded.

In Azure, the App Service system-assigned managed identity has the `Cognitive Services OpenAI User` role. For local development, `DefaultAzureCredential` is used unless `AZURE_OPENAI_API_KEY` is configured.

## Local development

Requirements:

- Node.js 22
- npm
- Azure credentials with model access, or an Azure OpenAI API key

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and configure:

```bash
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE-NAME.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-5.4-mini
```

For local API-key authentication, also set `AZURE_OPENAI_API_KEY`. Never expose it through a `NEXT_PUBLIC_` variable.

Validate a production build with:

```bash
npm run build
```

## Azure deployment

The deployed environment uses:

- Azure App Service for the Next.js application
- Azure OpenAI with `gpt-5.4-mini` version `2026-03-17`
- System-assigned managed identity and resource-scoped RBAC
- Azure Key Vault with RBAC authorization
- Application Insights and Log Analytics
- HTTPS-only transport with TLS 1.2 minimum

Subscription-scoped modular Bicep is available under `infra/`. Validate it with:

```bash
az bicep build --file infra/main.bicep
```

The checked-in parameter file contains non-secret deployment settings. `deployerObjectId` must be supplied explicitly during deployment; no credentials or local deployment-session artifacts are committed.

## Technology

- Next.js 16 and React 19
- TypeScript
- Tesseract.js and PDF.js for local OCR
- OpenAI JavaScript SDK and Azure Identity
- Bicep for Azure infrastructure
