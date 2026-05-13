# REFLECTION

## 1. Hardest Bug

The hardest bug was the Gemini API integration returning undefined 
for the summary text. I had the fetch call working — getting a 200 
response — but the summary was consistently undefined in the audit 
result. My first hypothesis was that the API key was wrong, but 
the 200 status ruled that out. Second hypothesis: the response 
shape was different from what I expected. I console.logged the 
full response object and found the actual text was nested at 
data.candidates[0].content.parts[0].text — I had been reading 
data.content[0].text which is the Anthropic shape, not Gemini's. 
The fix was a one-liner but finding it took an hour. The lesson: 
don't assume two LLM APIs have the same response shape. Read the 
actual response, don't guess from memory. I added a defensive 
optional-chain (data?.candidates?.[0]?.content?.parts?.[0]?.text) 
so any future shape mismatch falls through to the fallback 
template rather than crashing.

## 2. A Decision I Reversed

I initially built the audit results page as a client component 
that fetched its own data on mount. This meant the page had no 
OG metadata — Next.js can't generate dynamic metadata from 
client components. When I went to implement the shareable URL 
feature with proper Twitter card previews, I realized the 
architecture was wrong. I rewrote app/audit/[id]/page.tsx as 
a server component that fetches the audit data server-side and 
passes it to a client ResultsPage component as props. This meant 
generateMetadata could access the real savings number and inject 
it into the OG image URL. The reversal cost about 90 minutes but 
was the right call — the shareable URL with a dynamic OG image 
showing the actual savings number is one of the strongest features 
of the product. A static client-fetched page would have shown a 
generic preview on every share.

## 3. What I Would Build in Week 2

Three things in priority order. First, benchmark mode: "your team 
spends $X per developer per month — the median for a team your 
size is $Y." This requires collecting aggregate audit data, which 
we're already storing in Supabase, and computing percentiles. It 
makes every audit result more compelling because it adds social 
context. Second, a PDF export of the full report — something a 
CTO could email to their board or CFO. The results page is 
screenshot-friendly but a formatted PDF with the Credex branding 
would increase perceived value significantly. Third, a lightweight 
embeddable widget — a script tag that shows a single input 
("What's your monthly AI bill?") and redirects to SpendLens with 
that number pre-filled. This could be dropped into any blog post 
about AI costs and would drive qualified traffic with zero friction.

## 4. How I Used AI Tools

I used Claude (this assistant) heavily throughout the week for 
architecture decisions, Cursor prompts, and drafting the 
entrepreneurial markdown files. I used Cursor with Claude for 
the actual code generation — writing API routes, the audit engine, 
and TypeScript interfaces. I used v0 for the initial results page 
UI, then moved it into Cursor for customization.

What I didn't trust AI with: the audit engine reasoning. Every 
rule — wrong plan size, redundancy detection, alternative 
surfacing — I wrote the logic myself and verified the math 
manually. The whole point of the engine is that a finance person 
should agree with it. I wasn't going to let an LLM hallucinate 
pricing logic.

One specific time the AI was wrong: Cursor suggested using 
nanoid() with a dynamic import inside the API route handler. 
This caused a "module not found" error at runtime in the Vercel 
serverless environment. The fix was a top-level static import. 
The AI-generated code looked correct syntactically but had a 
runtime environment assumption baked in that didn't hold on Vercel.

## 5. Self-Ratings

**Discipline: 4/10**
I built most of the project in the final two days rather than 
spreading work across the week. The git history reflects this 
honestly. I committed in batches at the end of sessions rather 
than incrementally. This is the gap I'm most aware of and most 
committed to fixing.

**Code quality: 7/10**
TypeScript throughout, sensible abstractions, pure functions in 
the audit engine, proper error handling with fallbacks. The API 
routes are clean and the types are well-defined. Loses points for 
some rushed wiring between the form and the API that could use 
better error states.

**Design sense: 7/10**
The results page is genuinely screenshot-worthy — the savings 
hero, color-coded cards, dark Credex banner, and email capture 
all work together. The input form is functional but less polished. 
Mobile responsiveness is present but not tested as carefully as 
desktop.

**Problem-solving: 8/10**
Navigated the Anthropic API pricing issue quickly by switching to 
Gemini. Caught and fixed the server/client component architecture 
issue before it became a bigger problem. Debugged the Gemini 
response shape systematically rather than guessing.

**Entrepreneurial thinking: 6/10**
The GTM and ECONOMICS files are specific and grounded. I 
understand who the user is and why the unit economics work for 
Credex. Loses points for not completing real user interviews — 
that's the clearest signal of entrepreneurial thinking and I 
didn't prioritize it early enough.
