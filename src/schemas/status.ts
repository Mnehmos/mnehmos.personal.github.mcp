import { z } from 'zod';

// Cross-repo status summary
export const StatusSummarySchema = z.object({
  assignedIssues: z.array(z.object({
    number: z.number(),
    title: z.string(),
    repo: z.string(),
    url: z.string(),
    updatedAt: z.string(),
  })),
  assignedPRs: z.array(z.object({
    number: z.number(),
    title: z.string(),
    repo: z.string(),
    url: z.string(),
    state: z.string(),
    updatedAt: z.string(),
  })),
  reviewRequests: z.array(z.object({
    number: z.number(),
    title: z.string(),
    repo: z.string(),
    url: z.string(),
    author: z.string(),
  })),
  mentions: z.array(z.object({
    number: z.number(),
    title: z.string(),
    repo: z.string(),
    url: z.string(),
    type: z.enum(['issue', 'pr']),
  })),
});

export type StatusSummary = z.infer<typeof StatusSummarySchema>;

// Tool input schema
export const GithubStatusInputSchema = z.object({
  action: z.enum([
    'get', 'assigned', 'review_requests', 'mentions', 'activity'
  ]).describe('Action to perform'),

  // Filter by org
  org: z.string().optional().describe('Limit to specific organization'),

  // Exclude repos
  exclude: z.array(z.string()).optional()
    .describe('Repos to exclude (owner/repo format)'),

  // Include repos
  include: z.array(z.string()).optional()
    .describe('Only these repos (owner/repo format)'),

  // What to include in status
  sections: z.array(z.enum([
    'assigned_issues', 'assigned_prs', 'review_requests', 'mentions', 'activity'
  ])).optional().default(['assigned_issues', 'assigned_prs', 'review_requests']),

  limit: z.number().min(1).max(50).optional().default(10),
});

export type GithubStatusInput = z.infer<typeof GithubStatusInputSchema>;
