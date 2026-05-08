export interface Plan {
  id: string;
  name: string;
  pricePerSeat: number;
  minSeats: number;
  maxSeats: number | null;
  features: string[];
}

export interface Tool {
  id: string;
  name: string;
  vendor: string;
  plans: Plan[];
}

export interface UserToolInput {
  toolId: string;
  planId: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditInput {
  tools: UserToolInput[];
  teamSize: number;
  primaryUseCase: string;
}

export interface AuditRecommendation {
  toolId: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedPlan: string | null;
  projectedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;
}

export interface AuditResult {
  id: string;
  input: AuditInput;
  recommendations: AuditRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  summary: string;
  createdAt: Date;
}
