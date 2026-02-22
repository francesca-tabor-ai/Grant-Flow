import { Router, Request, Response } from 'express';
import { authMiddleware } from '../auth.js';

type Message = { role: 'user' | 'assistant'; content: string };

/** Platform knowledge: answers and guidance for GrantFlow. */
const PLATFORM_GUIDANCE: { keywords: string[]; response: string }[] = [
  {
    keywords: ['what can', 'what is', 'overview', 'introduction', 'help me', 'how does grantflow'],
    response:
      "**GrantFlow** helps you manage the full grant lifecycle: discover grants, manage organisations (e.g. your CIC), and create and track applications. Use **Organisations** to set up your profile and knowledge base, **Grants** to find funding, and **Applications** to draft proposals and budgets and track deadlines.",
  },
  {
    keywords: ['new application', 'start application', 'apply', 'create application'],
    response:
      "To start a new application: go to **Grants**, find a grant that fits your project, and use the **New application** action (or the **New application** button in the sidebar). You'll link an organisation and then can generate proposals and budgets with AI, and export to PDF or Word.",
  },
  {
    keywords: ['organisation', 'organization', 'manage org', 'cic', 'profile'],
    response:
      "**Organisations** (sidebar) is where you manage your organisation(s), e.g. your CIC. Add your profile and knowledge so the platform can tailor proposals and budgets. You need at least one organisation before creating applications.",
  },
  {
    keywords: ['find grant', 'grants', 'funding', 'match', 'discover', 'opportunit'],
    response:
      "Open **Grants** to browse and filter funding opportunities. You can search and filter to find grants that match your project. From a grant you can start a new application and link it to one of your organisations.",
  },
  {
    keywords: ['workflow', 'process', 'steps', 'application workflow', 'how do i apply'],
    response:
      "Workflow: 1) Add an **Organisation** and its details. 2) Go to **Grants** and pick a funding opportunity. 3) Start a **New application** linking that grant and organisation. 4) Use **Generate proposal** and **Generate budget** (and templates if available). 5) Export to PDF/DOCX and submit to the funder. Track deadlines and status on the application page.",
  },
  {
    keywords: ['proposal', 'generate proposal', 'write proposal'],
    response:
      "On an application's page you can **Generate proposal** to create a first draft from your organisation's knowledge and the grant requirements. You can edit the text and export to PDF or Word when ready.",
  },
  {
    keywords: ['budget', 'generate budget', 'cost'],
    response:
      "From an application you can **Generate budget** (and optionally pick a template). The platform uses the grant and your organisation info to suggest a budget structure. You can edit and export it with your proposal.",
  },
  {
    keywords: ['deadline', 'due date', 'alert'],
    response:
      "Application and grant deadlines are shown on the application and grant pages. Use **Alerts** (if available in your plan) to get reminders so you don't miss submission dates.",
  },
  {
    keywords: ['export', 'pdf', 'docx', 'download'],
    response:
      "On an application detail page, use **Export to PDF** or **Export to DOCX** to download your proposal (and budget if included) for submission to the funder.",
  },
  {
    keywords: ['hello', 'hi', 'hey'],
    response:
      "Hi! I'm here to help you get the most out of GrantFlow. You can ask things like: *What can I do here?*, *How do I start an application?*, or *Where do I manage my organisation?*",
  },
];

const FALLBACK =
  "I'm not sure about that. Try asking: *What can I do with GrantFlow?*, *How do I start a new application?*, or *Where do I manage my organisations?* I can also explain the application workflow, proposals, budgets, and exports.";

function answerPlatformQuestion(userMessage: string): string {
  const lower = userMessage.toLowerCase().trim();
  for (const { keywords, response } of PLATFORM_GUIDANCE) {
    if (keywords.some((k) => lower.includes(k))) return response;
  }
  return FALLBACK;
}

const router = Router();
router.use(authMiddleware);

router.post('/chat', (req: Request, res: Response) => {
  const body = req.body as { messages?: Message[] };
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const lastUser = messages.filter((m) => m.role === 'user').pop();
  const userContent = lastUser?.content?.trim() || '';

  const content = userContent ? answerPlatformQuestion(userContent) : FALLBACK;
  res.json({ message: { role: 'assistant' as const, content } });
});

export default router;
