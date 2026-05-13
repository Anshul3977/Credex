-- Supabase Schema for SpendLens

-- 1. Audits Table
CREATE TABLE IF NOT EXISTS public.audits (
  id text PRIMARY KEY,
  input jsonb NOT NULL,
  recommendations jsonb NOT NULL,
  total_monthly_savings numeric NOT NULL,
  total_annual_savings numeric NOT NULL,
  summary text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS but allow service role full access
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.audits FOR SELECT USING (true);
CREATE POLICY "Allow service role all access" ON public.audits USING (true) WITH CHECK (true);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id text REFERENCES public.audits(id),
  email text NOT NULL,
  company_name text,
  role text,
  team_size numeric,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role all access" ON public.leads USING (true) WITH CHECK (true);
