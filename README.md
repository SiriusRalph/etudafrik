# EtudAfrik

**A platform that helps African students find, compare and choose private schools in Morocco, with an AI assistant and AI-powered school recommendations.**

> **Demo project.** School information (descriptions, programs, tuition, contact details, ratings) is for illustration only and may be incomplete or inaccurate. Don't use it to make real study decisions.

The interface is in French, the main language of higher education in Morocco and of many of the students it targets.

---

## Features

### For students
- **School directory:** browse 37 private schools in 9 cities, search by name, filter by city and field of study.
- **School pages:** programs with level, language and yearly tuition; international partnerships; student reviews; contact details. Students can save schools to their favorites.
- **AI recommendations:** a 6-question survey (field, level, city, budget, language, priority) returns the 5 best-matching schools, each with a match score and the reasons it fits.
- **AI chat assistant:** answers questions about studying in Morocco (cost of living, visas, housing, scholarships) with streamed responses.
- **Student dashboard:** applications and their status, favorite schools, featured schools.
- **Arrival guide** (for enrolled students): visa and residence-permit steps, monthly budget, neighborhoods and practical tips.
- **Accounts:** email/password sign-up, plus Google and Apple sign-in through Lovable Cloud Auth.

### For schools
- **School dashboard:** manage the school profile, see applications, and run promotions (featured placement, promotional banners).

### For administrators
- **Admin dashboard:** platform statistics, schools, students, applications and reviews.

### Payments
- Recommendation credits are sold through **Stripe Checkout** (50 MAD for 3 recommendations). A webhook adds the credits once payment succeeds.

---

## How the AI recommendations work

The recommendation engine combines database filtering with a language model, so the model only ranks schools that really fit, and can't invent schools:

1. **Filter in the database:** fetch schools and their programs, keeping only those in the student's city (if chosen) with at least one program within budget.
2. **Rank candidates:** schools that offer the chosen field come first, then by satisfaction score. The top 15 are kept.
3. **Ask the model:** the candidates go to the LLM, which picks the 5 best and explains each choice (program, cost, fit with the student's priority) as structured JSON.
4. **Check the answer:** every returned school is matched back to the database, and any school without a program in budget is removed, even if the model suggested it.
5. **Save** the results to the student's account.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui (Radix), Framer Motion, Recharts |
| Data fetching | TanStack Query |
| Backend | Supabase (PostgreSQL with row-level security, Auth, Edge Functions on Deno) |
| AI | Groq API (`openai/gpt-oss-120b`) for chat and recommendations; Google Gemini for review analysis |
| Payments | Stripe Checkout and webhooks |
| Hosting | Vercel |

---

## Architecture

```
React app (Vercel)
  │
  ├── Supabase client ──► PostgreSQL (schools, programs, reviews, profiles, …)
  │                        protected by row-level security
  │
  └── Edge Functions (Supabase, Deno)
        ├── chat              ──► Groq   (streamed answers)
        ├── recommend         ──► Groq   (filter → rank → verify)
        ├── analyze-reviews   ──► Gemini (review summary)
        ├── create-payment    ──► Stripe Checkout
        └── stripe-webhook    ◄── Stripe (adds credits after payment)
```

All API keys for Groq, Gemini and Stripe live only on the server, as Supabase Edge Function secrets. The browser only ever receives the Supabase **publishable** key, which is safe to expose: row-level security decides what each user can read and write.

---

## Running locally

**Requirements:** Node.js 20+ and a Supabase project.

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a `.env` file** at the project root (it is git-ignored):
   ```bash
   VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
   ```
   Never put a secret or service-role key in this file. Every `VITE_` variable is built into the public website.

3. **Start the dev server**
   ```bash
   npm run dev
   ```

### Backend setup (Supabase)

```bash
supabase link --project-ref <your-project-ref>
supabase db push                      # apply the database schema
supabase secrets set GROK_API_KEY=... GEMINI_API_KEY=... STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=...
supabase functions deploy
```

`GROK_API_KEY` holds a **Groq** API key (from [console.groq.com](https://console.groq.com)), despite its name.

### Other commands

| Command | What it does |
| --- | --- |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Vitest) |

---

## Project structure

```
src/
  pages/            One file per route (Schools, SchoolDetail, Recommendation, Chat, Dashboard, …)
  components/       Landing-page sections, SchoolImage (cover/logo with fallbacks), shadcn/ui components
  contexts/         AuthContext (session, sign-in, sign-up)
  integrations/     Supabase client and generated database types
supabase/
  functions/        Edge Functions (chat, recommend, analyze-reviews, payments)
  migrations/       Database schema
public/             Static files, including locally hosted school logos
vercel.json         SPA rewrites so client-side routes work on refresh
```

---

## Known limitations

- **AI rate limits:** on Groq's free plan, the model allows about 8,000 tokens per minute, which is roughly two recommendations per minute across all users. When the limit is reached, users see a "try again in a minute" message and their credit is refunded.
- **Review analysis:** the `analyze-reviews` function still uses `gemini-1.5-flash`, which Google has retired, so it needs updating to a current Gemini model.
- **Images:** some school logos and photos are linked from third-party sites. If a link breaks, the app automatically shows a placeholder campus photo or a generic icon.
