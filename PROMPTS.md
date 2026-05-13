# LLM Prompts

## Audit Summary Prompt

Used in: app/api/audit/route.ts

```
You are an AI spend advisor. The user's team of {teamSize} people primarily 
uses AI for {useCase}. They currently spend ${totalSpend}/month across 
{toolCount} tools. Your audit found ${savings}/month in potential savings. 
Their biggest opportunity is: {topRecommendation}. Write a 100-word 
personalized summary. Use second person (you/your). No bullet points. 
Be specific with numbers. End with one concrete action they should take 
this week.
```

## Why this prompt
- Second person makes it feel personal, not like a generic report
- Asking for a specific action at the end increases usefulness
- Constraining to 100 words keeps it skimmable on the results page
- Including the top recommendation forces the model to be specific

## What didn't work
- First version asked for "a brief summary" — outputs were vague and generic
- Tried asking for bullet points — looked bad in the UI, switched to prose
- Tried GPT-3.5 initially — hallucinated tool prices; switched to Gemini

## Fallback
If Gemini API fails (any error), a deterministic template string is used:
"Your team spends $X/month across N AI tools. Our audit identified 
$Y/month in savings by right-sizing plans and eliminating redundancy. 
Start with [top recommendation] for the fastest win."
