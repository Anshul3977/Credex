'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, CheckCircle2, Lock } from 'lucide-react';
import { AuditResult, AuditRecommendation } from '@/types';

// ─── Types for the internal v0-style rendering ───────────────────────
interface ToolDisplay {
  name: string;
  currentSpend: number;
  action: 'Downgrade' | 'Switch' | 'Optimal' | 'Redundant';
  projectedSavings: number;
  reasoning: string;
}

// ─── Sample data used when no audit prop is provided ─────────────────
const SAMPLE_TOOLS: ToolDisplay[] = [
  {
    name: 'Slack',
    currentSpend: 450,
    action: 'Downgrade',
    projectedSavings: 180,
    reasoning: 'Your team uses <10% of Pro features; Standard plan includes all essentials.',
  },
  {
    name: 'Notion',
    currentSpend: 120,
    action: 'Redundant',
    projectedSavings: 120,
    reasoning: 'Google Workspace already covers docs, databases, and collaboration for less.',
  },
  {
    name: 'Figma',
    currentSpend: 780,
    action: 'Switch',
    projectedSavings: 280,
    reasoning: 'Penpot offers 95% feature parity at 60% lower cost with similar performance.',
  },
  {
    name: 'Linear',
    currentSpend: 300,
    action: 'Optimal',
    projectedSavings: 0,
    reasoning: 'Your usage perfectly matches this tier; no changes recommended.',
  },
  {
    name: 'Vercel',
    currentSpend: 250,
    action: 'Downgrade',
    projectedSavings: 150,
    reasoning: 'Current traffic levels suggest Pro plan provides more than you need.',
  },
];

const SAMPLE_AUDIT: AuditResult = {
  id: 'sample123',
  input: {
    tools: [],
    teamSize: 12,
    primaryUseCase: 'Engineering',
  },
  recommendations: [],
  totalMonthlySavings: SAMPLE_TOOLS.reduce((sum, t) => sum + t.projectedSavings, 0),
  totalAnnualSavings: SAMPLE_TOOLS.reduce((sum, t) => sum + t.projectedSavings, 0) * 12,
  summary:
    'Your company maintains a diverse SaaS portfolio with strong tool adoption. However, we identified significant overlap in document collaboration and project management capabilities. By consolidating redundant tools and right-sizing plans to actual usage patterns, you can maintain workflow quality while reducing monthly spend. The analysis suggests prioritizing the Figma-to-Penpot migration first due to the substantial savings and community support available.',
  createdAt: new Date(),
};

// ─── Helpers ─────────────────────────────────────────────────────────

function mapRecommendationToAction(rec: AuditRecommendation): ToolDisplay['action'] {
  const action = rec.recommendedAction.toLowerCase();
  if (action.includes('downgrade') || action.includes('audit your invoice')) return 'Downgrade';
  if (action.includes('switch') || action.includes('consider') || action.includes('alternative')) return 'Switch';
  if (action.includes('redundan') || action.includes('consolidate') || action.includes('drop')) return 'Redundant';
  if (rec.monthlySavings === 0) return 'Optimal';
  return 'Downgrade';
}

function mapAuditToTools(audit: AuditResult): ToolDisplay[] {
  if (!audit.recommendations || audit.recommendations.length === 0) return SAMPLE_TOOLS;
  return audit.recommendations.map((rec) => ({
    name: rec.toolId,
    currentSpend: rec.currentSpend,
    action: mapRecommendationToAction(rec),
    projectedSavings: rec.monthlySavings,
    reasoning: rec.reasoning,
  }));
}

// ─── Sub-components ──────────────────────────────────────────────────

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [target]);

  return <>{count.toLocaleString()}</>;
}

function ActionBadge({ action }: { action: ToolDisplay['action'] }) {
  const badgeConfig = {
    Downgrade: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    Switch: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    Optimal: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    Redundant: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  };

  const config = badgeConfig[action];

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {action}
    </span>
  );
}

function ToolCard({ tool }: { tool: ToolDisplay }) {
  const borderColorMap = {
    Downgrade: 'border-l-amber-500',
    Switch: 'border-l-blue-500',
    Optimal: 'border-l-green-500',
    Redundant: 'border-l-red-500',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColorMap[tool.action]} shadow-sm hover:shadow-md transition-shadow p-6`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
        <ActionBadge action={tool.action} />
      </div>
      <p className="text-sm text-gray-500 mb-5">{tool.reasoning}</p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Current Spend</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">${tool.currentSpend}/mo</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Projected Savings</p>
          {tool.projectedSavings > 0 ? (
            <p className="text-2xl font-bold text-green-600 mt-2">${tool.projectedSavings}/mo</p>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 mt-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Already optimal
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function AISummarySection({ summary }: { summary: string }) {
  return (
    <div className="bg-gray-100 rounded-2xl p-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">✦</span>
        <span className="text-sm font-semibold text-green-600 uppercase tracking-widest">AI Analysis</span>
      </div>
      <p className="text-gray-700 leading-relaxed">{summary}</p>
    </div>
  );
}

function EmailCaptureForm({ auditId }: { auditId: string }) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId,
          email,
          companyName: company || undefined,
          role: role || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Lead submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-md p-10 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Get your full report</h2>
      <p className="text-gray-600 text-sm mb-8">
        Free. No spam. We&apos;ll reach out only if we find more savings for you.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={submitted}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-50"
        />
        <input
          type="text"
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          disabled={submitted}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-50"
        />
        <input
          type="text"
          placeholder="Role (optional)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={submitted}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-50"
        />
        {/* Honeypot field */}
        <input type="text" aria-hidden="true" className="hidden" tabIndex={-1} autoComplete="off" />
        <Button
          type="submit"
          disabled={submitted || submitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-11 rounded-lg transition-all disabled:opacity-90"
        >
          {submitted ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Submitted
            </>
          ) : submitting ? (
            'Submitting...'
          ) : (
            'Submit'
          )}
        </Button>
      </form>
      <div className="flex items-center gap-2 mt-6 text-xs text-gray-500">
        <Lock className="w-3 h-3" />
        Your data is never sold or shared
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────

export default function ResultsPage({ audit }: { audit?: AuditResult }) {
  const [copied, setCopied] = useState(false);

  const data = audit ?? SAMPLE_AUDIT;
  const tools = audit?.recommendations?.length ? mapAuditToTools(data) : SAMPLE_TOOLS;
  const totalSavings = data.totalMonthlySavings;
  const annualSavings = data.totalAnnualSavings;
  const summary = data.summary;

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const showCredexBanner = totalSavings > 500;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-12">
            <Button
              onClick={handleShare}
              variant="ghost"
              className="gap-2 text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-200"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" />
                  Share
                </>
              )}
            </Button>
          </div>

          <div className="text-center pb-12">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-6">
              Your AI Spend Audit
            </p>
            {totalSavings >= 100 ? (
              <>
                <h1 className="text-5xl sm:text-6xl font-black text-gray-900 mb-3 text-balance">
                  You could save
                </h1>
                <div className="text-7xl sm:text-8xl font-black text-green-600 mb-4 leading-tight">
                  $<AnimatedCounter target={totalSavings} />/month
                </div>
                <p className="text-xl text-gray-600">
                  <span className="font-semibold">
                    $<AnimatedCounter target={annualSavings} />/year
                  </span>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-5xl sm:text-6xl font-black text-gray-900 mb-4 text-balance">
                  You&apos;re spending well
                </h1>
                <p className="text-lg text-gray-600">
                  Your SaaS stack is optimized. Minor adjustments could save a few dollars monthly.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* AI Summary Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AISummarySection summary={summary} />
        </div>
      </section>

      {/* Per-tool Breakdown */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto pt-12 mt-4">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">Breakdown by tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* Credex Banner */}
      {showCredexBanner && (
        <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-sm font-medium text-yellow-400 mb-1">
                💡 You have significant savings potential
              </p>
              <p className="text-xl font-bold">Capture these savings with Credex discounted AI credits</p>
              <p className="text-sm text-gray-400 mt-3">
                Credex sources discounted credits from companies that overforecast
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold whitespace-nowrap h-11 rounded-lg">
              Book Free Consultation →
            </Button>
          </div>
        </section>
      )}

      {/* Email Capture */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <EmailCaptureForm auditId={data.id} />
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500">Audited by SpendLens · Powered by Credex</p>
        </div>
      </footer>
    </main>
  );
}
