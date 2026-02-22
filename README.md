# GrantFlow AI

From discovery to submission—grant funding, simplified.

GrantFlow AI is a grant management platform for Community Interest Companies (CICs) and mission-driven organisations. One organisation profile feeds grant discovery, proposal drafts, and application tracking. The system does the repetitive work; you stay in control.

---

## Why GrantFlow AI

Grant applications are time-consuming and easy to miss. GrantFlow centralises your organisation data—mission, sector, finances, impact—and uses it to match grants, generate tailored proposals, and assemble application packages. Less duplication, fewer missed deadlines, clearer pipeline.

---

## What it does

**One profile, reused everywhere.**  
Store organisation details, mission, sector, location, financials, and impact metrics once. GrantFlow reuses this knowledge base across proposals and budgets so applications stay consistent.

**Discover and match.**  
Search and filter a grant database; get eligibility signals so you focus on opportunities that fit your CIC.

**Proposals that sound like you.**  
AI-powered drafting pulls from your profile and grant requirements. Edit, review, and keep full version history.

**Budgets and documents.**  
Generate budgets from templates, add cost justifications, orchestrate document assembly. Export to PDF or Word when ready.

**Track every application.**  
Dashboard for submission status, deadlines, and next steps. Compliance checks and pre-submission validation support complete, correct applications.

---

## Who it’s for

- CICs and social enterprises running multiple grant applications
- Fundraising and ops teams reducing duplication and missed deadlines
- Leaders who want pipeline and compliance visibility without spreadsheets

---

## Get started

See [TODO.md](./TODO.md) for the development roadmap and phase status.

### Run locally

- **Requirements:** Node 18+ (Node 20 LTS recommended; Node 25 may need a compatible `better-sqlite3` build).
- Install: `npm install`
- Database: the server creates SQLite at `server/data/grantflow.db` on first run. Seed grants: `npm run db:seed`
- Dev: `npm run dev` (client on port 5173, API on port 3001)
- Build: `npm run build`
- Tests: `npm run test` (client Vitest); server agent tests in `server/src/agents/*.test.ts` (run with Vitest or Node + tsx).

### Testing & deployment

- **Unit tests (Vitest):** client `npm run test --workspace=client`; add server tests with `vitest` in the server workspace.
- **Integration:** run the API and client, then exercise flows (register → create org → view grants → create application → generate proposal → export PDF).
- **Deployment:** build client (`npm run build`), run server with `NODE_ENV=production` and set `JWT_SECRET` and optional `DATABASE_PATH` / `PORT`. Serve client static files from the API or a reverse proxy.
  - **Split deployment (client on Vercel/Cloudflare, API elsewhere):** Deploy the Express server (Railway, Render, Fly.io, etc.), then set `VITE_API_URL` to your API base URL when building the client (e.g. `VITE_API_URL=https://api.example.com npm run build --workspace=client`). Without this, auth and API calls will 404. The `client/public/_redirects` and `vercel.json` enable SPA routing on static hosts.

---

## Design system

GrantFlow’s visual language is calm, confident, and developer-first. The goal is invisible infrastructure: the product is the hero, not the branding.

### Typography

- **Typeface:** Humanist sans-serif. Very high legibility at all sizes; soft curves and precise geometry so it feels technical but friendly. Works for both marketing headlines and dense dashboards.
- **Headlines:** Large, bold, confident. Prefer sentence-case.
- **Body:** Regular or light weights, generous line height.
- **UI and numbers:** Clear, neutral, optimised for data readability.

*Overall vibe: We’re serious, but not intimidating.*

### Colour

- **Core palette:** Black / near-black for primary text; white as the dominant background; cool greys for UI structure, dividers, and secondary text.
- **Accent:** A signature multi-colour gradient (purples, blues, pinks, oranges). Used sparingly—hero sections, illustrations, highlights. Accents guide attention; they don’t overwhelm content.
- **Effect:** Trustworthy and clean (finance); modern and creative (tech). Instantly recognizable even without a logo.

### Brand and layout

- **Personality:** Developer-first. Calm, confident, quietly powerful.
- **Layout:** Lots of white space; strong typographic hierarchy; rounded UI components; subtle motion and depth.
- **Imagery:** Realistic product mockups as the hero. Neutral partner logos (monochrome). Illustrations that feel technical, modular, and abstract.

---

*GrantFlow AI—smarter grant management for organisations that exist to make a difference.*

<!-- redeploy -->
