import { z } from 'zod';
// Notification data from GitHub
export const NotificationSchema = z.object({
    id: z.string(),
    unread: z.boolean(),
    reason: z.string(),
    updatedAt: z.string(),
    lastReadAt: z.string().nullable(),
    subject: z.object({
        title: z.string(),
        url: z.string().nullable(),
        type: z.string(), // Issue, PullRequest, Commit, etc.
    }),
    repository: z.object({
        name: z.string(),
        fullName: z.string(),
    }),
});
// Tool input schema
export const GithubNotificationInputSchema = z.object({
    action: z.enum([
        'list', 'get', 'mark_read', 'mark_all_read', 'mark_done', 'subscribe', 'unsubscribe'
    ]).describe('Action to perform'),
    // For get, mark_read, mark_done
    threadId: z.string().optional().describe('Notification thread ID'),
    // For list filters
    all: z.boolean().optional().describe('Include read notifications'),
    participating: z.boolean().optional().describe('Only participating notifications'),
    since: z.string().optional().describe('Only after date (ISO 8601)'),
    before: z.string().optional().describe('Only before date (ISO 8601)'),
    repo: z.string().optional().describe('Filter by repo (owner/repo)'),
    // For subscribe/unsubscribe
    owner: z.string().optional(),
    repoName: z.string().optional(),
    issueNumber: z.number().optional(),
    limit: z.number().min(1).max(100).optional().default(50),
});
//# sourceMappingURL=notification.js.map