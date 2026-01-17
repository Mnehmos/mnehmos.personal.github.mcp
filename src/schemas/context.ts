import { z } from 'zod';

export const GithubContextInputSchema = z.object({
  action: z.enum(['get', 'set_focus', 'get_blockers', 'get_timeline']).describe('Action to perform'),

  repo: z.string().describe('Repository in owner/repo format'),

  // For set_focus
  issue: z.coerce.number().optional().describe('Issue number to set as current focus'),

  // For get - accept string (comma-separated) or array
  include: z.preprocess(
    (val) => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val,
    z.array(z.enum([
      'active_tasks',      // Issues assigned to @me, state:open
      'blockers',          // Issues with "blocker" label
      'recent_comments',   // Latest comments across issues
      'in_progress',       // Issues labeled "in-progress"
      'milestones',        // Active milestones with progress
      'prs',               // Open pull requests
      'recent_closed',     // Recently closed issues
    ])).optional().default(['active_tasks', 'blockers', 'in_progress'])
  ),

  limit: z.object({
    tasks: z.coerce.number().min(1).max(50).optional().default(10),
    comments: z.coerce.number().min(1).max(50).optional().default(10),
    prs: z.coerce.number().min(1).max(20).optional().default(5),
    closed: z.coerce.number().min(1).max(20).optional().default(5),
  }).optional(),

  // For get_timeline
  since: z.string().optional().describe('ISO date to filter events from'),
});

export type GithubContextInput = z.infer<typeof GithubContextInputSchema>;

// Context response types
export interface ActiveContext {
  repo: string;
  timestamp: string;
  currentFocus: {
    number: number;
    title: string;
    url: string;
  } | null;
  activeTasks: Array<{
    number: number;
    title: string;
    labels: string[];
    priority: 'critical' | 'high' | 'medium' | 'low' | 'none';
    updatedAt: string;
  }>;
  blockers: Array<{
    number: number;
    title: string;
    blocking: number[];
  }>;
  inProgress: Array<{
    number: number;
    title: string;
    assignee: string;
    startedAt: string;
  }>;
  recentComments: Array<{
    issue: number;
    issueTitle: string;
    author: string;
    body: string;
    createdAt: string;
  }>;
  milestones: Array<{
    title: string;
    progress: { open: number; closed: number };
    dueOn: string | null;
  }>;
  pullRequests: Array<{
    number: number;
    title: string;
    author: string;
    state: string;
    reviewStatus: string;
  }>;
}
