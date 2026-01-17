import { z } from 'zod';
// Label data from GitHub
export const LabelSchema = z.object({
    name: z.string(),
    color: z.string(),
    description: z.string().nullable().optional(),
    id: z.string().optional(),
    default: z.boolean().optional(),
});
// Tool input schema
export const GithubLabelInputSchema = z.object({
    action: z.enum([
        'list', 'get', 'create', 'edit', 'delete', 'clone'
    ]).describe('Action to perform'),
    repo: z.string().describe('Repository in owner/repo format'),
    // For get, edit, delete
    name: z.string().optional().describe('Label name'),
    // For create, edit
    color: z.string().optional().describe('Hex color without # (e.g., "ff0000")'),
    description: z.string().optional().describe('Label description'),
    newName: z.string().optional().describe('New name when renaming'),
    // For clone
    sourceRepo: z.string().optional().describe('Source repo for cloning labels'),
});
//# sourceMappingURL=label.js.map