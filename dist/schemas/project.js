import { z } from 'zod';
export const GithubProjectInputSchema = z.object({
    action: z.enum([
        'list', // List all projects
        'get', // Get project details with items
        'get_column', // Get items in specific column/status
        'move', // Move issue between columns (set status field)
        'add_item', // Add issue to project
        'remove_item', // Remove issue from project
        'list_fields', // List project fields (for discovering field IDs)
        'set_field', // Set any field value on a project item
        'create_draft', // Create a draft issue in project
    ]).describe('Action to perform'),
    repo: z.string().describe('Repository in owner/repo format'),
    // Project identification
    project: z.union([z.string(), z.number()]).optional()
        .describe('Project name or number'),
    // For move, set_field
    issue: z.number().optional().describe('Issue number'),
    itemId: z.string().optional().describe('Project item ID (from get action)'),
    // For move
    from: z.string().optional().describe('Source column/status'),
    to: z.string().optional().describe('Target column/status'),
    // For set_field
    field: z.string().optional().describe('Field name (e.g., Status, Priority, Sprint)'),
    fieldValue: z.string().optional().describe('Field value to set'),
    // For get_column
    column: z.string().optional().describe('Column name to fetch'),
    // For add_item
    contentId: z.string().optional().describe('Issue node ID'),
    // For create_draft
    title: z.string().optional().describe('Draft issue title'),
    body: z.string().optional().describe('Draft issue body'),
    // For move with comment
    comment: z.string().optional().describe('Comment to add when moving'),
});
//# sourceMappingURL=project.js.map