import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createClient } from '@supabase/supabase-js';
import { runAudit } from '@/lib/auditEngine';
import { auditInputSchema } from '@/lib/schema';
import { AuditInput } from '@/types';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
    const body = await req.json();

    // 1. Validate input
    const parseResult = auditInputSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.format() },
        { status: 400 },
      );
    }
    const input: AuditInput = parseResult.data;

    // 2. Run Audit Engine
    const result = runAudit(input);

    // 3. Get top recommendation and totals for the prompt
    const topRec =
      result.recommendations[0]?.recommendedAction ?? 'consolidating tools';
    const totalSpend = input.tools.reduce(
      (sum, t) => sum + t.monthlySpend,
      0,
    );

    // 4. Call Gemini for summary
    const fallbackSummary = `Your team spends $${totalSpend}/month across ${input.tools.length} AI tools. Our audit identified $${result.totalMonthlySavings}/month ($${result.totalAnnualSavings}/year) in potential savings by right-sizing plans and eliminating redundancy. Your biggest opportunity is ${topRec}. This week, review your active subscriptions and downgrade or cancel the flagged tools — most vendors allow mid-cycle changes.`;

    let summary = fallbackSummary;

    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an AI spend advisor. The user's team of ${input.teamSize} people primarily uses AI for ${input.primaryUseCase}. They currently spend $${totalSpend}/month across ${input.tools.length} tools. Your audit found $${result.totalMonthlySavings}/month in potential savings. Their biggest opportunity is: ${topRec}. Write a 100-word personalized summary. Use second person. No bullet points. Be specific with numbers. End with one concrete action they should take this week.`,
                  },
                ],
              },
            ],
          }),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            summary = candidateText;
          }
        } else {
          console.error(
            'Gemini API error:',
            geminiRes.status,
            await geminiRes.text(),
          );
        }
      } catch (err) {
        console.error('Gemini API call failed:', err);
        // Falls through to fallback summary
      }
    }

    // 5. Generate ID and save to Supabase
    const id = nanoid(10);

    if (supabase) {
      const { error } = await supabase.from('audits').insert({
        id,
        input,
        recommendations: result.recommendations,
        total_monthly_savings: result.totalMonthlySavings,
        total_annual_savings: result.totalAnnualSavings,
        summary,
      });

      if (error) {
        console.error('Supabase Insert Error:', error);
        // Still return the result — don't crash
      }
    } else {
      console.warn('Supabase env vars missing, skipping insert');
    }

    // 6. Return result
    return NextResponse.json({
      id,
      result: { ...result, id, summary },
    });
  } catch (error) {
    console.error('Audit generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing audit' },
      { status: 500 },
    );
  }
}
