import { z } from 'zod';
export const GithubWikiInputSchema = z.object({
    action: z.enum([
        'get', // Read a wiki page
        'update', // Update existing page
        'create', // Create new page
        'list', // List all wiki pages
        'search', // Search wiki content
    ]).describe('Action to perform'),
    repo: z.string().describe('Repository in owner/repo format'),
    // For get, update
    page: z.string().optional()
        .describe('Page slug (e.g., "Home", "Architecture-Decisions")'),
    // For update, create
    content: z.string().optional().describe('Page content in markdown'),
    message: z.string().optional().describe('Commit message for the change'),
    // For search
    query: z.string().optional().describe('Search query'),
});
//# sourceMappingURL=wiki.js.map