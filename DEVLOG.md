# DEVLOG

## Day 1 — 2026-05-07
**Hours worked:** 1
**What I did:** Received the assignment. Read through all requirements 
carefully twice. Noted that entrepreneurial files carry 25 points — 
more than any single engineering dimension. Set up GitHub repo and 
created initial Next.js scaffold.
**What I learned:** The git commit discipline requirement is checked 
programmatically. Should have started committing smaller changes from 
day one.
**Blockers / what I'm stuck on:** Deciding on stack — Next.js App Router 
vs Pages Router. Went with App Router for server-side OG metadata generation.
**Plan for tomorrow:** Build pricing data types and audit engine logic first. 
UI can come later.

## Day 2 — 2026-05-08
**Hours worked:** 2
**What I did:** Defined all TypeScript interfaces in types/index.ts. 
Built pricing data constants in data/pricing.ts with 8 tools. 
Started audit engine rules — got Rules 1 and 6 working (wrong plan 
size, honest assessment).
**What I learned:** Keeping the audit engine as pure functions with 
no side effects makes it much easier to test. Learned this by trying 
to test it with side effects first and hitting mocking issues.
**Blockers / what I'm stuck on:** Anthropic API requires paid credits — 
not actually free as I assumed. Need to find an alternative.
**Plan for tomorrow:** Finish audit engine, switch to Gemini API for 
the AI summary feature.

## Day 3 — 2026-05-09
**Hours worked:** 3
**What I did:** Completed all 6 audit engine rules. Switched to Gemini 
1.5 Flash for AI summaries — genuinely free tier, 1500 requests/day. 
Wrote first 7 unit tests. All passing. Started on input form UI.
**What I learned:** Gemini's response structure is different from 
Anthropic's — data.candidates[0].content.parts[0].text vs data.content[0].text. 
Spent 30 mins debugging this before reading the docs properly.
**Blockers / what I'm stuck on:** Input form has a lot of state — 
multiple tools, each with plan/seats/spend. React Hook Form helps 
but nested field arrays are tricky.
**Plan for tomorrow:** Finish input form, start API routes and Supabase.

## Day 4 — 2026-05-10
**Hours worked:** 2
**What I did:** Completed input form with localStorage persistence. 
Set up Supabase project and ran SQL migrations for audits and leads 
tables. Started /api/audit POST route.
**What I learned:** Supabase service key vs anon key distinction matters — 
anon key respects RLS policies, service key bypasses them. For server-side 
API routes, always use service key.
**Blockers / what I'm stuck on:** nanoid ESM/CJS compatibility issue 
with Next.js. Fixed by using nanoid/non-secure or pinning to v3.
**Plan for tomorrow:** Finish API routes, wire results page to real data.

## Day 5 — 2026-05-11
**Hours worked:** 3
**What I did:** Completed /api/audit and /api/leads routes. Wired 
results page to real audit data — no more hardcoded sample data. 
Built OG image route using ImageResponse. Tested end-to-end flow: 
form → audit → results page → email capture.
**What I learned:** Next.js ImageResponse requires edge runtime — 
regular Node.js runtime doesn't support it. Cost me an hour of 
debugging a cryptic error.
**Blockers / what I'm stuck on:** Resend requires a verified sending 
domain on free tier. Used their onboarding domain for now as a workaround.
**Plan for tomorrow:** Add CI, remaining tests, all markdown files.

## Day 6 — 2026-05-12
**Hours worked:** 4
**What I did:** Added GitHub Actions CI workflow. Added 5 more tests 
to audit engine — now 12 total, all passing. Wrote all 12 required 
markdown files: README, ARCHITECTURE, REFLECTION, TESTS, PRICING_DATA, 
PROMPTS, GTM, ECONOMICS, LANDING_COPY, METRICS. Fixed a bug in 
ChatGPT Team alternative detection that was too narrow on use case matching.
**What I learned:** Writing GTM and ECONOMICS forced me to think about 
who actually uses this and whether the unit economics work. The 
conversion funnel math suggests this is a viable lead-gen tool if 
Credex closes even 20% of high-savings consultations.
**Blockers / what I'm stuck on:** Git commit history is concentrated — 
I was building in batches and committing at the end of sessions rather 
than incrementally. This is a real discipline gap I'm noting honestly.
**Plan for tomorrow:** Final deploy check, verify all files present, submit.

## Day 7 — 2026-05-13
**Hours worked:** 3
**What I did:** Final end-to-end test on deployed URL. Verified all 
12 markdown files present at repo root. Confirmed CI is green. 
Checked Lighthouse scores. Submitted via Google Form.
**What I learned:** Committing incrementally throughout the day — not 
just at the end of a session — is a discipline I'll carry forward. 
The git log check is a real signal of working habits, not just a 
gotcha.
**Blockers / what I'm stuck on:** Git commit day count is below the 
5-day requirement due to batch committing. Submitting honestly and 
noting this in the reflection.
**Plan for tomorrow:** N/A — submitted.
