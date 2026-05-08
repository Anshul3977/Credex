# Cred — AI Tool Spend Auditor

Audit your team's AI tool subscriptions. Identify overspend, redundancies, and right-sizing opportunities across Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf, and more.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth & DB**: Supabase
- **Email**: Resend
- **Validation**: Zod + React Hook Form

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in your keys in .env.local

# Run development server
npm run dev

# Run tests
npm run test

# Lint
npm run lint
```

## Project Structure

```
/app          — Next.js App Router routes
/components   — Reusable UI components (shadcn/ui)
/lib          — Audit engine, utilities
/types        — TypeScript interfaces
/data         — Pricing data constants
```

## Audit Engine

The core audit logic lives in `/lib/auditEngine.ts`. It's a **pure function** with no side effects that evaluates your tool stack against 6 rules:

1. **Wrong Plan Size** — Team/Business plan with ≤2 seats
2. **Overpaying vs Actual** — Invoice exceeds expected cost
3. **Cheaper Same-Vendor Plan** — Business tier for non-coding use
4. **Cheaper Alternative Tool** — Cross-tool recommendations
5. **Credits Opportunity** — Credex discounts for high spenders
6. **Be Honest** — Validates well-configured setups

## License

Private — All rights reserved.
