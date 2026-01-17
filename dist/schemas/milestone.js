import { z } from 'zod';
// Milestone data from GitHub
export const MilestoneSchema = z.object({
    number: z.number(),
    title: z.string(),
    description: z.string().nullable().optional(),
    state: z.enum(['open', 'closed']),
    dueOn: z.string().nullable().optional(),
    closedAt: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    openIssues: z.number().optional(),
    closedIssues: z.number().optional(),
    url: z.string().optional(),
});
// Tool input schema
export const GithubMilestoneInputSchema = z.object({
    action: z.enum([
        'list', 'get', 'create', 'edit', 'delete'
    ]).describe('Action to perform'),
    repo: z.string().describe('Repository in owner/repo format'),
    // For get, edit, delete
    milestone: z.union([z.number(), z.string()]).optional()
        .describe('Milestone number or title'),
    // For create, edit
    title: z.string().optional().describe('Milestone title'),
    description: z.string().optional().describe('Milestone description'),
    dueOn: z.string().optional().describe('Due date (YYYY-MM-DD)'),
    state: z.enum(['open', 'closed']).optional(),
});
//# sourceMappingURL=milestone.js.map