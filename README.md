##Saral Form - Your intelligent form assistant


Saral Form helps people understand and prepare Indian government applications in clear English or Hindi. It explains difficult questions, shows the information and documents needed, checks readiness, and directs the user to the correct official government portal for final submission.
The website currently supports
•  Voter registration through Form 6
•  Fresh and re-issued passport preparation
•  New PAN applications and PAN corrections
•  Income, caste, and domicile certificate preparation
•  National scholarship application preparation
Saral Form is a preparation service, not a government portal. It does not submit applications, approve eligibility, make payments, book appointments, or change government records.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result - will soon be developing the hosted website - stay tuned!

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Grounded assistant

Ask Saral uses Azure OpenAI's Responses API with a configurable deployment. The recommended model is `gpt-5.4-mini`. Retrieval runs over the approved bilingual form schemas, document requirements, eligibility prompts, service instructions, verification metadata, and official URLs in this repository.

The model can call only three read-only tools:

- `search_official_guidance`
- `get_form_context`
- `check_preparation_status`

The browser sends the question, selected service, field IDs, document IDs, and completion state. It does not send entered form values. Responses use `store: false`, and unsupported answers are marked as not grounded.

Copy the names from `.env.example` into `.env.local` and configure:

```bash
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE-NAME.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-5.4-mini
```

For local API-key authentication, set `AZURE_OPENAI_API_KEY` in `.env.local`. Do not expose it through a `NEXT_PUBLIC_` variable. When the key is omitted, the server uses `DefaultAzureCredential`; in Azure, assign its managed identity permission to invoke the model deployment.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
