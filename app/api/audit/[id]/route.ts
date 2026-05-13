import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuditResult } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Reconstruct the AuditResult object
    const result: AuditResult = {
      id: data.id,
      input: data.input,
      recommendations: data.recommendations,
      totalMonthlySavings: Number(data.total_monthly_savings),
      totalAnnualSavings: Number(data.total_annual_savings),
      summary: data.summary,
      createdAt: new Date(data.created_at),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('Internal server error fetching audit:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
