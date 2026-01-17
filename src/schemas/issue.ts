import { z } from 'zod';

// Label aliases for fuzzy matching
export const LABEL_ALIASES: Record<string, string> = {
  // State aliases
  'in progress': 'in-progress',
  'wip': 'in-progress',
  'working': 'in-progress',
  'started': 'in-progress',

  // Type aliases
  'bugfix': 'bug',
  'fix': 'bug',
  'defect': 'bug',
  'feature request': 'enhancement',
  'feature': 'enhancement',
  'feat': 'enhancement',
  'docs': 'documentation',
  'doc': 'documentation',

  // Priority aliases
  'high pri': 'priority:high',
  'high priority': 'priority:high',
  'p0': 'priority:critical',
  'p1': 'priority:high',
  'p2': 'priority:medium',
  'p3': 'priority:low',
  'critical': 'priority:critical',
  'urgent': 'priority:critical',

  // Category aliases
  'research': 'research',
  'investigate': 'research',
  'spike': 'research',
  'idea': 'idea',
  'thought': 'idea',
  'todo': 'todo',
  'task': 'todo',
};

// State normalization
export const STATE_ALIASES: Record<string, 'open' | 'closed'> = {
  'open': 'open',
  'active': 'open',
  'new': 'open',
  'reopened': 'open',
  'closed': 'closed',
  'done': 'closed',
  'completed': 'closed',
  'resolved': 'closed',
  'fixed': 'closed',
  'wontfix': 'closed',
};

export function normalizeLabel(label: string): string {
  const lower = label.toLowerCase().trim();
  return LABEL_ALIASES[lower] || label;
}

export function normalizeState(state: string): 'open' | 'closed' {
  const lower = state.toLowerCase().trim();
  return STATE_ALIASES[lower] || 'open';
}

// Issue data returned from GitHub
export const IssueSchema = z.object({
  number: z.number(),
  title: z.string(),
  body: z.string().nullable(),
  state: z.enum(['open', 'closed', 'OPEN', 'CLOSED']).transform(s => s.toLowerCase() as 'open' | 'closed'),
  url: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  closedAt: z.string().nullable().optional(),
  author: z.object({
    login: z.string(),
  }).optional(),
  assignees: z.array(z.object({
    login: z.string(),
  })).optional().default([]),
  labels: z.array(z.object({
    name: z.string(),
  })).optional().default([]),
  milestone: z.object({
    title: z.string(),
    number: z.number(),
  }).nullable().optional(),
  comments: z.array(z.object({
    author: z.object({ login: z.string() }),
    body: z.string(),
    createdAt: z.string(),
  })).optional().default([]),
});

export type Issue = z.infer<typeof IssueSchema>;

// Tool input schemas
export const GithubIssueInputSchema = z.object({
  action: z.enum([
    'create', 'get', 'update', 'close', 'reopen',
    'comment', 'search', 'list', 'batch_update'
  ]).describe('Action to perform'),

  repo: z.string().describe('Repository in owner/repo format'),

  // For get, update, close, reopen, comment
  issue: z.coerce.number().optional().describe('Issue number'),

  // For create, update - accept string (comma-separated) or array
  title: z.string().optional().describe('Issue title'),
  body: z.string().optional().describe('Issue body (markdown)'),
  labels: z.preprocess(
    (val) => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val,
    z.array(z.string()).optional()
  ).describe('Labels to apply (fuzzy matched)'),
  assignees: z.preprocess(
    (val) => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val,
    z.array(z.string()).optional()
  ).describe('Assignees (@me for self)'),
  milestone: z.string().optional().describe('Milestone title or number'),

  // For close
  reason: z.enum(['completed', 'not_planned']).optional().default('completed'),

  // For comment
  comment: z.string().optional().describe('Comment body (markdown)'),

  // For search, list
  query: z.string().optional().describe('Search query text'),
  filters: z.object({
    state: z.enum(['open', 'closed', 'all']).optional().default('open'),
    labels: z.array(z.string()).optional(),
    assignee: z.string().optional(),
    author: z.string().optional(),
    mentions: z.string().optional(),
    milestone: z.string().optional(),
    created: z.string().optional().describe('Date filter like >2024-01-01'),
    updated: z.string().optional(),
    sort: z.enum(['created', 'updated', 'comments']).optional().default('updated'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(30),

  // For batch_update
  operations: z.array(z.object({
    issue: z.number(),
    labels: z.object({
      add: z.array(z.string()).optional(),
      remove: z.array(z.string()).optional(),
    }).optional(),
    assignees: z.object({
      add: z.array(z.string()).optional(),
      remove: z.array(z.string()).optional(),
    }).optional(),
    state: z.enum(['open', 'closed']).optional(),
    comment: z.string().optional(),
  })).optional(),
});

export type GithubIssueInput = z.infer<typeof GithubIssueInputSchema>;
