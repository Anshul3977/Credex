import { z } from 'zod';

export const userToolSchema = z.object({
  toolId: z.string().min(1, 'Please select a tool'),
  planId: z.string().min(1, 'Please select a plan'),
  seats: z.number().min(1, 'Must have at least 1 seat'),
  monthlySpend: z.number().min(0, 'Spend cannot be negative'),
});

export const auditInputSchema = z.object({
  teamSize: z.number().min(1, 'Team size must be at least 1'),
  primaryUseCase: z.string().min(1, 'Please specify primary use case'),
  tools: z
    .array(userToolSchema)
    .min(1, 'Please add at least one tool')
    .max(10, 'Maximum of 10 tools supported for free audit'),
});

export type AuditInputFormValues = z.infer<typeof auditInputSchema>;

export const leadCaptureSchema = z.object({
  auditId: z.string(),
  email: z.string().email('Please enter a valid email address'),
  companyName: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.number().optional(),
  website: z.string().optional(), // Honeypot field
});
