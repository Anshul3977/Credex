import {
  AuditInput,
  AuditResult,
  AuditRecommendation,
  UserToolInput,
} from '@/types';
import { getToolById, getPlanById, TOOLS } from '@/data/pricing';

// ──────────────────────────────────────────────────────────────────────
// Helper: generate a simple ID (no external deps for purity)
// ──────────────────────────────────────────────────────────────────────

function generateId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ──────────────────────────────────────────────────────────────────────
// Rule 1: WRONG PLAN SIZE
// If user is on Team/Business plan but seats ≤ 2, recommend individual.
// ──────────────────────────────────────────────────────────────────────

export function checkWrongPlanSize(
  entry: UserToolInput,
): AuditRecommendation | null {
  const tool = getToolById(entry.toolId);
  const plan = getPlanById(entry.toolId, entry.planId);
  if (!tool || !plan) return null;

  const planNameLower = plan.name.toLowerCase();
  const isTeamOrBusiness =
    planNameLower.includes('team') || planNameLower.includes('business');

  if (!isTeamOrBusiness || entry.seats > 2) return null;

  // Find the cheapest individual/pro plan for this tool
  const individualPlan = tool.plans.find((p) => {
    const n = p.name.toLowerCase();
    return (
      n.includes('individual') ||
      n.includes('pro') ||
      n.includes('plus') ||
      n === 'hobby'
    );
  });

  if (!individualPlan) return null;

  const currentSpend = entry.seats * plan.pricePerSeat;
  const projectedSpend = entry.seats * individualPlan.pricePerSeat;
  const monthlySavings = currentSpend - projectedSpend;

  if (monthlySavings <= 0) return null;

  return {
    toolId: entry.toolId,
    currentSpend,
    recommendedAction: `Downgrade from ${plan.name} to ${individualPlan.name}`,
    recommendedPlan: individualPlan.id,
    projectedSpend,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reasoning:
      `You have ${entry.seats} seat(s) on the ${tool.name} ${plan.name} plan at $${plan.pricePerSeat}/seat/mo ` +
      `(total $${currentSpend}/mo). With ≤2 users, the ${individualPlan.name} plan at ` +
      `$${individualPlan.pricePerSeat}/seat/mo would cost $${projectedSpend}/mo — ` +
      `saving $${monthlySavings}/mo ($${monthlySavings * 12}/yr). ` +
      `Team/Business features like admin dashboards and SSO are rarely needed at this scale.`,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Rule 2: OVERPAYING VS ACTUAL
// If user's reported monthlySpend > seats × planPrice, flag discrepancy.
// ──────────────────────────────────────────────────────────────────────

export function checkOverpaying(
  entry: UserToolInput,
): AuditRecommendation | null {
  const tool = getToolById(entry.toolId);
  const plan = getPlanById(entry.toolId, entry.planId);
  if (!tool || !plan) return null;

  // Skip custom-priced plans (price = 0 means "contact sales")
  if (plan.pricePerSeat === 0) return null;

  const expectedSpend = entry.seats * plan.pricePerSeat;

  if (entry.monthlySpend <= expectedSpend) return null;

  const overpayment = entry.monthlySpend - expectedSpend;

  return {
    toolId: entry.toolId,
    currentSpend: entry.monthlySpend,
    recommendedAction: 'Audit your invoice — you may be overpaying',
    recommendedPlan: null,
    projectedSpend: expectedSpend,
    monthlySavings: overpayment,
    annualSavings: overpayment * 12,
    reasoning:
      `You report spending $${entry.monthlySpend}/mo on ${tool.name} ${plan.name}, but at ` +
      `$${plan.pricePerSeat}/seat × ${entry.seats} seats the expected cost is $${expectedSpend}/mo. ` +
      `That's a $${overpayment}/mo discrepancy. Check for unused seats, stale licenses, ` +
      `or billing errors on your invoice.`,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Rule 3: CHEAPER SAME-VENDOR PLAN
// If on Business but use case is "writing" or "research" (not coding),
// recommend Pro tier instead.
// ──────────────────────────────────────────────────────────────────────

export function checkCheaperSameVendor(
  entry: UserToolInput,
  primaryUseCase: string,
): AuditRecommendation | null {
  const tool = getToolById(entry.toolId);
  const plan = getPlanById(entry.toolId, entry.planId);
  if (!tool || !plan) return null;

  const useCaseLower = primaryUseCase.toLowerCase();
  const isNonCoding =
    useCaseLower.includes('writing') || useCaseLower.includes('research');
  const isBusinessPlan = plan.name.toLowerCase().includes('business');

  if (!isBusinessPlan || !isNonCoding) return null;

  const proPlan = tool.plans.find((p) =>
    p.name.toLowerCase().includes('pro'),
  );
  if (!proPlan) return null;

  const currentSpend = entry.seats * plan.pricePerSeat;
  const projectedSpend = entry.seats * proPlan.pricePerSeat;
  const monthlySavings = currentSpend - projectedSpend;

  if (monthlySavings <= 0) return null;

  return {
    toolId: entry.toolId,
    currentSpend,
    recommendedAction: `Downgrade from ${plan.name} to ${proPlan.name} — Business features aren't needed for ${primaryUseCase}`,
    recommendedPlan: proPlan.id,
    projectedSpend,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reasoning:
      `Your primary use case is "${primaryUseCase}", which doesn't require Business-tier features ` +
      `like SSO, audit logs, or admin controls. The ${proPlan.name} plan at ` +
      `$${proPlan.pricePerSeat}/seat/mo (vs $${plan.pricePerSeat}/seat/mo) provides the same core ` +
      `functionality. With ${entry.seats} seats, you'd save $${monthlySavings}/mo ($${monthlySavings * 12}/yr).`,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Rule 4: CHEAPER ALTERNATIVE TOOL
// Cross-tool recommendations and redundancy detection.
// ──────────────────────────────────────────────────────────────────────

export function checkCheaperAlternative(
  entries: UserToolInput[],
  primaryUseCase: string,
): AuditRecommendation[] {
  const recommendations: AuditRecommendation[] = [];
  const useCaseLower = primaryUseCase.toLowerCase();
  const isCoding =
    useCaseLower.includes('coding') ||
    useCaseLower.includes('development') ||
    useCaseLower.includes('engineering');

  const isWriting =
    useCaseLower.includes('writing') ||
    useCaseLower.includes('content') ||
    useCaseLower.includes('copy');

  // 4a: Copilot Business ($19/seat) for coding with >5 seats → surface Cursor Pro ($20/seat)
  const copilotEntry = entries.find((e) => {
    const plan = getPlanById(e.toolId, e.planId);
    return (
      e.toolId === 'github-copilot' &&
      plan?.name.toLowerCase().includes('business')
    );
  });

  if (copilotEntry && isCoding && copilotEntry.seats > 5) {
    const copilotPlan = getPlanById(copilotEntry.toolId, copilotEntry.planId)!;
    const currentSpend = copilotEntry.seats * copilotPlan.pricePerSeat;

    recommendations.push({
      toolId: 'github-copilot',
      currentSpend,
      recommendedAction:
        'Consider Cursor Pro as an alternative — stronger context features at a comparable price',
      recommendedPlan: 'cursor-pro',
      projectedSpend: copilotEntry.seats * 20, // Cursor Pro is $20/seat
      monthlySavings: 0, // Cursor is actually $1 more per seat, so no direct savings
      annualSavings: 0,
      reasoning:
        `You're on GitHub Copilot Business at $${copilotPlan.pricePerSeat}/seat/mo for ${copilotEntry.seats} seats ` +
        `($${currentSpend}/mo). Cursor Pro at $20/seat/mo is comparable in price ($${copilotEntry.seats * 20}/mo) ` +
        `but offers stronger codebase-wide context features, multi-file editing, and more advanced AI ` +
        `completions. While not cheaper per seat, the productivity gains may justify evaluation. ` +
        `Note: Cursor is $1/seat/mo more, so this is a feature recommendation, not a cost savings.`,
    });
  }

  // 4b: ChatGPT Team for coding or writing → surface Claude Team
  const chatgptTeamEntry = entries.find((e) => {
    const plan = getPlanById(e.toolId, e.planId);
    return (
      e.toolId === 'chatgpt' && plan?.name.toLowerCase().includes('team')
    );
  });

  if (chatgptTeamEntry && (isCoding || isWriting)) {
    const chatgptPlan = getPlanById(
      chatgptTeamEntry.toolId,
      chatgptTeamEntry.planId,
    )!;
    const currentSpend = chatgptTeamEntry.seats * chatgptPlan.pricePerSeat;

    recommendations.push({
      toolId: 'chatgpt',
      currentSpend,
      recommendedAction:
        'Consider Claude Team as an alternative — better long-context performance for coding and writing',
      recommendedPlan: 'claude-team',
      projectedSpend: chatgptTeamEntry.seats * 30, // Same price
      monthlySavings: 0,
      annualSavings: 0,
      reasoning:
        `You're on ChatGPT Team at $${chatgptPlan.pricePerSeat}/seat/mo for ${chatgptTeamEntry.seats} seats ` +
        `($${currentSpend}/mo). Claude Team is the same price ($30/seat/mo) but offers significantly better ` +
        `long-context performance — critical for tasks involving large documents or codebases. This is a ` +
        `feature recommendation, not a cost-saving one.`,
    });
  }

  // 4c: Both Anthropic API AND Claude Pro → flag redundancy
  const hasClaudePro = entries.some((e) => e.planId === 'claude-pro');
  const anthropicApiEntry = entries.find((e) => e.toolId === 'anthropic-api');

  if (hasClaudePro && anthropicApiEntry) {
    const claudeProEntry = entries.find((e) => e.planId === 'claude-pro')!;
    const claudeProPlan = getPlanById(
      claudeProEntry.toolId,
      claudeProEntry.planId,
    )!;
    const apiPlan = getPlanById(
      anthropicApiEntry.toolId,
      anthropicApiEntry.planId,
    )!;

    const totalSpend =
      claudeProEntry.monthlySpend + anthropicApiEntry.monthlySpend;

    // If API spend is light, they can probably just use Claude Pro's chat
    // If API spend is heavy, they should drop the $20 Claude Pro subscription
    const isLightApiUse = anthropicApiEntry.monthlySpend <= 50;
    const dropTarget = isLightApiUse ? 'Anthropic API' : 'Claude Pro';
    const savings = isLightApiUse
      ? anthropicApiEntry.monthlySpend
      : claudeProEntry.monthlySpend;

    recommendations.push({
      toolId: isLightApiUse ? 'anthropic-api' : 'claude',
      currentSpend: totalSpend,
      recommendedAction: `Consolidate — drop ${dropTarget} to eliminate redundancy`,
      recommendedPlan: null,
      projectedSpend: totalSpend - savings,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reasoning: isLightApiUse
        ? `You're paying for both Claude Pro ($${claudeProPlan.pricePerSeat}/mo) and Anthropic API ` +
          `($${anthropicApiEntry.monthlySpend}/mo). With light API usage (≤$50/mo), Claude Pro's ` +
          `chat interface likely covers your needs. Drop the API subscription to save ` +
          `$${savings}/mo ($${savings * 12}/yr).`
        : `You're paying for both Claude Pro ($${claudeProPlan.pricePerSeat}/mo) and Anthropic API ` +
          `($${anthropicApiEntry.monthlySpend}/mo). With heavy API usage, the API is your primary ` +
          `tool. Drop the $${claudeProPlan.pricePerSeat}/mo Claude Pro subscription — you can still ` +
          `use the free tier for occasional chat. Saves $${savings}/mo ($${savings * 12}/yr).`,
    });
  }

  return recommendations;
}

// ──────────────────────────────────────────────────────────────────────
// Rule 5: CREDITS OPPORTUNITY
// If total monthly spend > $200, flag Credex discount opportunity.
// ──────────────────────────────────────────────────────────────────────

export function checkCreditsOpportunity(
  entries: UserToolInput[],
): AuditRecommendation | null {
  const totalSpend = entries.reduce((sum, e) => sum + e.monthlySpend, 0);

  if (totalSpend <= 200) return null;

  return {
    toolId: 'credex',
    currentSpend: totalSpend,
    recommendedAction:
      'Purchase discounted credits through Credex to reduce costs',
    recommendedPlan: null,
    projectedSpend: totalSpend, // Exact savings depend on Credex rates
    monthlySavings: 0, // Cannot calculate exact savings without rates
    annualSavings: 0,
    reasoning:
      `Your total monthly AI tool spend is $${totalSpend}/mo ($${totalSpend * 12}/yr). ` +
      `At this volume, Credex sells discounted credits for many of these tools — ` +
      `typical discounts range from 5–20%. Contact Credex for a custom quote based on your ` +
      `specific tool mix and volume.`,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Main audit engine
// ──────────────────────────────────────────────────────────────────────

export function runAudit(input: AuditInput): AuditResult {
  const recommendations: AuditRecommendation[] = [];

  // Apply per-tool rules (Rules 1, 2, 3)
  for (const entry of input.tools) {
    const wrongPlanSize = checkWrongPlanSize(entry);
    if (wrongPlanSize) recommendations.push(wrongPlanSize);

    const overpaying = checkOverpaying(entry);
    if (overpaying) recommendations.push(overpaying);

    const cheaperSameVendor = checkCheaperSameVendor(
      entry,
      input.primaryUseCase,
    );
    if (cheaperSameVendor) recommendations.push(cheaperSameVendor);
  }

  // Apply cross-tool rules (Rule 4)
  const alternatives = checkCheaperAlternative(
    input.tools,
    input.primaryUseCase,
  );
  recommendations.push(...alternatives);

  // Apply spend-level rules (Rule 5)
  const creditsOpp = checkCreditsOpportunity(input.tools);
  if (creditsOpp) recommendations.push(creditsOpp);

  // Calculate totals
  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.monthlySavings,
    0,
  );
  const totalAnnualSavings = totalMonthlySavings * 12;

  // Rule 6: BE HONEST — generate summary
  const summary =
    recommendations.length === 0 ||
    recommendations.every((r) => r.monthlySavings === 0)
      ? "Your AI tool stack is well-optimized. No significant cost savings were identified. You're spending well."
      : `We identified ${recommendations.filter((r) => r.monthlySavings > 0).length} cost-saving ` +
        `opportunity(ies) totaling $${totalMonthlySavings}/mo ($${totalAnnualSavings}/yr) in potential savings.`;

  return {
    id: generateId(),
    input,
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings,
    summary,
    createdAt: new Date(),
  };
}
