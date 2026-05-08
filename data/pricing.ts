import { Tool } from '@/types';

/**
 * Pricing data for AI/dev tools.
 *
 * IMPORTANT: Prices listed here were accurate at the time of writing.
 * Always verify against the source URLs before submission.
 */

export const TOOLS: Tool[] = [
  // ─── Cursor ────────────────────────────────────────────────────────
  {
    id: 'cursor',
    name: 'Cursor',
    vendor: 'Anysphere',
    plans: [
      // Source: https://www.cursor.com/pricing — verify before submission
      {
        id: 'cursor-hobby',
        name: 'Hobby',
        pricePerSeat: 0,
        minSeats: 1,
        maxSeats: 1,
        features: ['2000 completions', '50 slow premium requests'],
      },
      // Source: https://www.cursor.com/pricing — verify before submission
      {
        id: 'cursor-pro',
        name: 'Pro',
        pricePerSeat: 20,
        minSeats: 1,
        maxSeats: null,
        features: [
          'Unlimited completions',
          '500 fast premium requests',
          'Unlimited slow premium requests',
        ],
      },
      // Source: https://www.cursor.com/pricing — verify before submission
      {
        id: 'cursor-business',
        name: 'Business',
        pricePerSeat: 40,
        minSeats: 1,
        maxSeats: null,
        features: [
          'Everything in Pro',
          'Admin dashboard',
          'Enforced privacy mode',
          'SAML/SSO',
        ],
      },
    ],
  },

  // ─── GitHub Copilot ────────────────────────────────────────────────
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    vendor: 'GitHub / Microsoft',
    plans: [
      // Source: https://github.com/features/copilot — verify before submission
      {
        id: 'copilot-individual',
        name: 'Individual',
        pricePerSeat: 10,
        minSeats: 1,
        maxSeats: 1,
        features: ['Code completions', 'Chat in IDE', 'CLI assistance'],
      },
      // Source: https://github.com/features/copilot — verify before submission
      {
        id: 'copilot-business',
        name: 'Business',
        pricePerSeat: 19,
        minSeats: 1,
        maxSeats: null,
        features: [
          'Everything in Individual',
          'Organization-wide policy management',
          'Audit logs',
          'IP indemnity',
        ],
      },
      // Source: https://github.com/features/copilot — verify before submission
      {
        id: 'copilot-enterprise',
        name: 'Enterprise',
        pricePerSeat: 39,
        minSeats: 1,
        maxSeats: null,
        features: [
          'Everything in Business',
          'Fine-tuned models for your codebase',
          'Documentation search',
        ],
      },
    ],
  },

  // ─── Claude (Anthropic) ───────────────────────────────────────────
  {
    id: 'claude',
    name: 'Claude',
    vendor: 'Anthropic',
    plans: [
      // Source: https://claude.ai/pricing — verify before submission
      {
        id: 'claude-pro',
        name: 'Pro',
        pricePerSeat: 20,
        minSeats: 1,
        maxSeats: 1,
        features: [
          'Priority access',
          'Claude 3.5 Sonnet & Opus',
          'More usage than free',
        ],
      },
      // Source: https://claude.ai/pricing — verify before submission
      {
        id: 'claude-max',
        name: 'Max',
        pricePerSeat: 100,
        minSeats: 1,
        maxSeats: 1,
        features: [
          'Everything in Pro',
          '20x more usage',
          'Extended thinking',
        ],
      },
      // Source: https://claude.ai/pricing — verify before submission
      {
        id: 'claude-team',
        name: 'Team',
        pricePerSeat: 30,
        minSeats: 5,
        maxSeats: null,
        features: [
          'Everything in Pro',
          'Higher usage limits',
          'Admin controls',
          'Central billing',
        ],
      },
      // Source: https://claude.ai/pricing — verify before submission
      {
        id: 'claude-enterprise',
        name: 'Enterprise',
        pricePerSeat: 0, // custom pricing — contact sales
        minSeats: 1,
        maxSeats: null,
        features: [
          'Everything in Team',
          'SSO/SAML',
          'Domain capture',
          'Custom data retention',
        ],
      },
    ],
  },

  // ─── ChatGPT (OpenAI) ─────────────────────────────────────────────
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    vendor: 'OpenAI',
    plans: [
      // Source: https://openai.com/chatgpt/pricing — verify before submission
      {
        id: 'chatgpt-plus',
        name: 'Plus',
        pricePerSeat: 20,
        minSeats: 1,
        maxSeats: 1,
        features: [
          'GPT-4o',
          'Advanced data analysis',
          'DALL·E image generation',
          'Custom GPTs',
        ],
      },
      // Source: https://openai.com/chatgpt/pricing — verify before submission
      {
        id: 'chatgpt-team',
        name: 'Team',
        pricePerSeat: 30,
        minSeats: 2,
        maxSeats: null,
        features: [
          'Everything in Plus',
          'Higher message caps',
          'Workspace management',
          'Data excluded from training',
        ],
      },
      // Source: https://openai.com/chatgpt/pricing — verify before submission
      {
        id: 'chatgpt-enterprise',
        name: 'Enterprise',
        pricePerSeat: 0, // custom pricing — contact sales
        minSeats: 1,
        maxSeats: null,
        features: [
          'Everything in Team',
          'Unlimited GPT-4o',
          'SSO',
          'Domain verification',
          'Advanced admin',
        ],
      },
    ],
  },

  // ─── Anthropic API ────────────────────────────────────────────────
  {
    id: 'anthropic-api',
    name: 'Anthropic API',
    vendor: 'Anthropic',
    plans: [
      // Source: https://docs.anthropic.com/en/docs/about-claude/models — verify before submission
      // Pay-per-token; estimates based on typical usage
      {
        id: 'anthropic-api-light',
        name: 'Light Usage',
        pricePerSeat: 50,
        minSeats: 1,
        maxSeats: null,
        features: [
          'Pay-per-token',
          '~$50/mo estimate',
          'Occasional API calls',
        ],
      },
      // Source: https://docs.anthropic.com/en/docs/about-claude/models — verify before submission
      {
        id: 'anthropic-api-medium',
        name: 'Medium Usage',
        pricePerSeat: 200,
        minSeats: 1,
        maxSeats: null,
        features: [
          'Pay-per-token',
          '~$200/mo estimate',
          'Regular development use',
        ],
      },
      // Source: https://docs.anthropic.com/en/docs/about-claude/models — verify before submission
      {
        id: 'anthropic-api-heavy',
        name: 'Heavy Usage',
        pricePerSeat: 500,
        minSeats: 1,
        maxSeats: null,
        features: [
          'Pay-per-token',
          '~$500/mo estimate',
          'Production-level throughput',
        ],
      },
    ],
  },

  // ─── OpenAI API ───────────────────────────────────────────────────
  {
    id: 'openai-api',
    name: 'OpenAI API',
    vendor: 'OpenAI',
    plans: [
      // Source: https://openai.com/api/pricing — verify before submission
      // Pay-per-token; estimates based on typical usage
      {
        id: 'openai-api-light',
        name: 'Light Usage',
        pricePerSeat: 50,
        minSeats: 1,
        maxSeats: null,
        features: [
          'Pay-per-token',
          '~$50/mo estimate',
          'Occasional API calls',
        ],
      },
      // Source: https://openai.com/api/pricing — verify before submission
      {
        id: 'openai-api-medium',
        name: 'Medium Usage',
        pricePerSeat: 200,
        minSeats: 1,
        maxSeats: null,
        features: [
          'Pay-per-token',
          '~$200/mo estimate',
          'Regular development use',
        ],
      },
      // Source: https://openai.com/api/pricing — verify before submission
      {
        id: 'openai-api-heavy',
        name: 'Heavy Usage',
        pricePerSeat: 500,
        minSeats: 1,
        maxSeats: null,
        features: [
          'Pay-per-token',
          '~$500/mo estimate',
          'Production-level throughput',
        ],
      },
    ],
  },

  // ─── Gemini (Google) ──────────────────────────────────────────────
  {
    id: 'gemini',
    name: 'Gemini',
    vendor: 'Google',
    plans: [
      // Source: https://one.google.com/about/plans — verify before submission
      {
        id: 'gemini-pro',
        name: 'Pro (Google One AI Premium)',
        pricePerSeat: 20,
        minSeats: 1,
        maxSeats: 1,
        features: [
          'Gemini Advanced',
          '2TB storage',
          'Gemini in Gmail, Docs, etc.',
        ],
      },
      // Source: https://one.google.com/about/plans — verify before submission
      {
        id: 'gemini-ultra',
        name: 'Ultra',
        pricePerSeat: 30,
        minSeats: 1,
        maxSeats: 1,
        features: [
          'Everything in Pro',
          'Higher rate limits',
          'Priority access to new features',
        ],
      },
    ],
  },

  // ─── Windsurf (Codeium) ───────────────────────────────────────────
  {
    id: 'windsurf',
    name: 'Windsurf',
    vendor: 'Codeium',
    plans: [
      // Source: https://windsurf.com/pricing — verify before submission
      {
        id: 'windsurf-free',
        name: 'Free',
        pricePerSeat: 0,
        minSeats: 1,
        maxSeats: 1,
        features: ['Basic completions', 'Limited chat'],
      },
      // Source: https://windsurf.com/pricing — verify before submission
      {
        id: 'windsurf-pro',
        name: 'Pro',
        pricePerSeat: 15,
        minSeats: 1,
        maxSeats: null,
        features: [
          'Unlimited completions',
          'Advanced chat',
          'Personalization',
        ],
      },
      // Source: https://windsurf.com/pricing — verify before submission
      {
        id: 'windsurf-teams',
        name: 'Teams',
        pricePerSeat: 35,
        minSeats: 1,
        maxSeats: null,
        features: [
          'Everything in Pro',
          'Admin console',
          'Team management',
          'Usage analytics',
        ],
      },
    ],
  },
];

/**
 * Helper: look up a Tool by ID.
 */
export function getToolById(toolId: string): Tool | undefined {
  return TOOLS.find((t) => t.id === toolId);
}

/**
 * Helper: look up a Plan by ID within a given Tool.
 */
export function getPlanById(
  toolId: string,
  planId: string,
): Tool['plans'][number] | undefined {
  const tool = getToolById(toolId);
  return tool?.plans.find((p) => p.id === planId);
}
