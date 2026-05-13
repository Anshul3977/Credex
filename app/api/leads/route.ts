import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

// In-memory rate limiter
// In production on Vercel, this is reset per-lambda instance.
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 60 minutes
const MAX_ATTEMPTS = 3;

export async function POST(req: Request) {
  try {
    // 1. Parse body
    const body = await req.json();
    const {
      auditId,
      email,
      companyName,
      role,
      teamSize,
      website,
    } = body;

    // 2. Honeypot: if website has any value, silently succeed
    if (website && website.length > 0) {
      return NextResponse.json({ success: true });
    }

    // 3. Rate limit
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const now = Date.now();
    let timestamps = rateLimitMap.get(ip) || [];
    timestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

    if (timestamps.length >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 },
      );
    }

    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);

    // 4. Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 },
      );
    }

    // 5. Save to Supabase leads table
    const { error: dbError } = await supabase.from('leads').insert({
      audit_id: auditId,
      email,
      company_name: companyName,
      role,
      team_size: teamSize,
    });

    if (dbError) {
      console.error('Lead insert error:', dbError);
    }

    // Fetch savings for the email
    let monthlySavings = 0;
    if (auditId) {
      const { data: auditData } = await supabase
        .from('audits')
        .select('total_monthly_savings')
        .eq('id', auditId)
        .single();

      if (auditData) {
        monthlySavings = Number(auditData.total_monthly_savings);
      }
    }

    // 6. Send email via Resend only if RESEND_API_KEY exists
    if (process.env.RESEND_API_KEY) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'SpendLens <hello@spendlens.com>',
            to: [email],
            subject: 'Your SpendLens AI Spend Audit',
            html: `<h2>Your audit is ready</h2>
              <p>We found <strong>$${monthlySavings}/month</strong> in potential savings.</p>
              <p>— Team SpendLens</p>`,
          }),
        });

        if (!emailRes.ok) {
          const errBody = await emailRes.text();
          console.error('Resend email error:', emailRes.status, errBody);
        }
      } catch (emailErr) {
        console.error('Resend API call failed:', emailErr);
        // Don't fail the whole request because of email
      }
    }

    // 7. Return success
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Lead capture error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
