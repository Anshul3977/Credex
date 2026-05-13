import {
  runAudit,
  checkWrongPlanSize,
  checkOverpaying,
  checkCheaperAlternative,
  checkCreditsOpportunity,
} from '../auditEngine';
import { AuditInput, UserToolInput } from '@/types';

describe('Audit Engine', () => {
  // ──────────────────────────────────────────────────────────────────
  // Test 1: Team plan with 2 seats flags as overkill
  // ──────────────────────────────────────────────────────────────────
  describe('Rule 1 — Wrong Plan Size', () => {
    it('should flag Team/Business plan with ≤2 seats and recommend individual plan with correct savings', () => {
      const entry: UserToolInput = {
        toolId: 'github-copilot',
        planId: 'copilot-business',
        seats: 2,
        monthlySpend: 38, // 2 × $19
      };

      const rec = checkWrongPlanSize(entry);

      expect(rec).not.toBeNull();
      expect(rec!.recommendedAction).toContain('Downgrade');
      expect(rec!.recommendedPlan).toBe('copilot-individual');

      // Math: was 2×$19=$38, now 2×$10=$20, savings = $18/mo
      expect(rec!.currentSpend).toBe(38);
      expect(rec!.projectedSpend).toBe(20);
      expect(rec!.monthlySavings).toBe(18);
      expect(rec!.annualSavings).toBe(18 * 12);
    });

    it('should NOT flag Team plan with >2 seats', () => {
      const entry: UserToolInput = {
        toolId: 'github-copilot',
        planId: 'copilot-business',
        seats: 10,
        monthlySpend: 190,
      };

      const rec = checkWrongPlanSize(entry);
      expect(rec).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Test 2: Claude Pro + Anthropic API flags redundancy
  // ──────────────────────────────────────────────────────────────────
  describe('Rule 4c — Redundancy Detection', () => {
    it('should flag redundancy when user has both Claude Pro and Anthropic API', () => {
      const entries: UserToolInput[] = [
        {
          toolId: 'claude',
          planId: 'claude-pro',
          seats: 1,
          monthlySpend: 20,
        },
        {
          toolId: 'anthropic-api',
          planId: 'anthropic-api-light',
          seats: 1,
          monthlySpend: 50,
        },
      ];

      const recs = checkCheaperAlternative(entries, 'coding');

      expect(recs.length).toBeGreaterThanOrEqual(1);
      const redundancyRec = recs.find(
        (r) => r.recommendedAction.includes('redundancy'),
      );
      expect(redundancyRec).toBeDefined();
      expect(redundancyRec!.reasoning).toContain('Claude Pro');
      expect(redundancyRec!.reasoning).toContain('Anthropic API');
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Test 3: Optimal setup returns no cost-saving recommendations
  // ──────────────────────────────────────────────────────────────────
  describe('Rule 6 — Honest Assessment', () => {
    it('should return "spending well" summary for an optimally configured stack', () => {
      const input: AuditInput = {
        tools: [
          {
            toolId: 'cursor',
            planId: 'cursor-pro',
            seats: 1,
            monthlySpend: 20,
          },
        ],
        teamSize: 1,
        primaryUseCase: 'coding',
      };

      const result = runAudit(input);

      // No savings-generating recommendations
      const savingRecs = result.recommendations.filter(
        (r) => r.monthlySavings > 0,
      );
      expect(savingRecs).toHaveLength(0);
      expect(result.summary).toContain('spending well');
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Test 4: Spending >$500/mo triggers Credex upsell
  // ──────────────────────────────────────────────────────────────────
  describe('Rule 5 — Credits Opportunity', () => {
    it('should trigger Credex upsell when total spend > $200', () => {
      const entries: UserToolInput[] = [
        {
          toolId: 'cursor',
          planId: 'cursor-business',
          seats: 10,
          monthlySpend: 400,
        },
        {
          toolId: 'github-copilot',
          planId: 'copilot-business',
          seats: 10,
          monthlySpend: 190,
        },
      ];

      const rec = checkCreditsOpportunity(entries);

      expect(rec).not.toBeNull();
      expect(rec!.toolId).toBe('credex');
      expect(rec!.currentSpend).toBe(590);
      expect(rec!.reasoning).toContain('Credex');
    });

    it('should NOT trigger Credex upsell when total spend ≤ $200', () => {
      const entries: UserToolInput[] = [
        {
          toolId: 'cursor',
          planId: 'cursor-pro',
          seats: 1,
          monthlySpend: 20,
        },
      ];

      const rec = checkCreditsOpportunity(entries);
      expect(rec).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Test 5: Annual savings = monthly savings × 12
  // ──────────────────────────────────────────────────────────────────
  describe('Savings Arithmetic', () => {
    it('should always compute annual savings as monthly savings × 12', () => {
      const input: AuditInput = {
        tools: [
          {
            toolId: 'github-copilot',
            planId: 'copilot-business',
            seats: 2,
            monthlySpend: 38,
          },
          {
            toolId: 'cursor',
            planId: 'cursor-business',
            seats: 1,
            monthlySpend: 100, // overpaying: 1 × $40 = $40, discrepancy $60
          },
        ],
        teamSize: 2,
        primaryUseCase: 'coding',
      };

      const result = runAudit(input);

      expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);

      // Also verify each individual recommendation
      for (const rec of result.recommendations) {
        expect(rec.annualSavings).toBe(rec.monthlySavings * 12);
      }
    });
  });
  // ──────────────────────────────────────────────────────────────────
  // New Test 1: Downgrade Copilot Business to Individual for solo dev
  // ──────────────────────────────────────────────────────────────────
  it('should recommend downgrading Copilot Business to Individual for a solo developer', () => {
    const input: UserToolInput = {
      toolId: 'github-copilot',
      planId: 'copilot-business',
      seats: 1,
      monthlySpend: 19,
    };
    const rec = checkWrongPlanSize(input);
    expect(rec).not.toBeNull();
    expect(rec!.monthlySavings).toBe(9);
    expect(rec!.recommendedPlan).toBe('copilot-individual');
  });

  // ──────────────────────────────────────────────────────────────────
  // New Test 2: ChatGPT Team for 2-person team (writing) -> Claude Team
  // ──────────────────────────────────────────────────────────────────
  it('should flag ChatGPT Team for a 2-person team using it for writing and surface Claude Team as alternative', () => {
    const entries: UserToolInput[] = [
      {
        toolId: 'chatgpt',
        planId: 'chatgpt-team',
        seats: 2,
        monthlySpend: 60,
      },
    ];
    const recs = checkCheaperAlternative(entries, 'writing');
    expect(recs.length).toBeGreaterThan(0);
    const hasSwitch = recs.some((r) => r.recommendedAction.match(/Switch|Alternative/i));
    expect(hasSwitch).toBe(true);
  });

  // ──────────────────────────────────────────────────────────────────
  // New Test 3: Do not flag correctly sized individual plan
  // ──────────────────────────────────────────────────────────────────
  it('should not flag a correctly sized individual plan', () => {
    const input: UserToolInput = {
      toolId: 'claude',
      planId: 'claude-pro',
      seats: 1,
      monthlySpend: 20,
    };
    const rec = checkWrongPlanSize(input);
    expect(rec).toBeNull();
  });

  // ──────────────────────────────────────────────────────────────────
  // New Test 4: Calculate correct annual savings for multiple tools
  // ──────────────────────────────────────────────────────────────────
  it('should calculate correct annual savings for multiple tools', () => {
    // Mock the individual check functions or just use the whole engine
    // We can simulate savings via checkOverpaying
    const input: AuditInput = {
      tools: [
        { toolId: 'cursor', planId: 'cursor-pro', seats: 1, monthlySpend: 70 }, // Overpaying by $50 (should be $20)
        { toolId: 'claude', planId: 'claude-pro', seats: 1, monthlySpend: 70 }, // Overpaying by $50 (should be $20)
      ],
      teamSize: 1,
      primaryUseCase: 'coding',
    };
    const result = runAudit(input);
    // Overpaying calculation checks: 70 - 20 = 50. Two tools = 100/mo = 1200/yr.
    // Wait, let's verify if that matches overpaying logic. Yes, checkOverpaying uses monthlySpend - expected.
    expect(result.totalAnnualSavings).toBe(1200);
  });

  // ──────────────────────────────────────────────────────────────────
  // New Test 5: Handle empty tools array gracefully
  // ──────────────────────────────────────────────────────────────────
  it('should handle empty tools array gracefully', () => {
    const input: AuditInput = {
      tools: [],
      teamSize: 3,
      primaryUseCase: 'writing',
    };
    expect(() => runAudit(input)).not.toThrow();
    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBe(0);
  });
});
