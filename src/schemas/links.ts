import { z } from 'zod';

export const LinkType = z.enum([
  'blocks',      // This issue blocks another
  'blocked_by',  // This issue is blocked by another
  'relates',     // Related issues
  'duplicates',  // This is a duplicate of another
  'parent',      // Parent issue (epic)
  'child',       // Child issue (subtask)
]);

export type LinkType = z.infer<typeof LinkType>;

export const GithubLinksInputSchema = z.object({
  action: z.enum([
    'add',           // Create a link between issues
    'remove',        // Remove a link
    'get_graph',     // Get dependency graph for an issue
    'find_blockers', // Find all issues blocking a target
    'find_cycles',   // Detect circular dependencies
  ]).describe('Action to perform'),

  repo: z.string().describe('Repository in owner/repo format'),

  // For add, remove
  source: z.number().optional().describe('Source issue number'),
  target: z.number().optional().describe('Target issue number'),
  type: LinkType.optional().describe('Type of relationship'),

  // For get_graph
  issue: z.number().optional().describe('Issue to get graph for'),
  depth: z.number().min(1).max(5).optional().default(2)
    .describe('How deep to traverse relationships'),
});

export type GithubLinksInput = z.infer<typeof GithubLinksInputSchema>;

// Graph types
export interface IssueNode {
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: string[];
}

export interface IssueLink {
  source: number;
  target: number;
  type: LinkType;
}

export interface DependencyGraph {
  nodes: IssueNode[];
  edges: IssueLink[];
  cycles: number[][];  // Arrays of issue numbers forming cycles
}
