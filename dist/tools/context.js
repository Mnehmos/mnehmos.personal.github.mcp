/**
 * GitHub Context tool implementation.
 * Session context reconstruction for agents.
 */
import { ghIssue, ghPr } from '../cli.js';
import { GithubContextInputSchema } from '../schemas/context.js';
import { formatActiveContext, formatBlockers } from '../formatters/context.js';
/**
 * Main context tool handler.
 */
export async function handleContextTool(input) {
    const parsed = GithubContextInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            action: input.action,
            error: `Validation error: ${parsed.error.message}`,
        };
    }
    const { action } = parsed.data;
    switch (action) {
        case 'get':
            return handleGetContext(parsed.data);
        case 'set_focus':
            return handleSetFocus(parsed.data);
        case 'get_blockers':
            return handleGetBlockers(parsed.data);
        case 'get_timeline':
            return handleGetTimeline(parsed.data);
        default:
            return {
                success: false,
                action,
                error: `Unknown action: ${action}`,
            };
    }
}
async function handleGetContext(input) {
    const include = input.include || ['active_tasks', 'blockers', 'in_progress'];
    const limits = input.limit || { tasks: 10, comments: 10, prs: 5, closed: 5 };
    const context = {
        repo: input.repo,
        timestamp: new Date().toISOString(),
        currentFocus: null,
        activeTasks: [],
        blockers: [],
        inProgress: [],
        recentComments: [],
        milestones: [],
        pullRequests: [],
    };
    // Fetch active tasks (assigned to @me)
    if (include.includes('active_tasks')) {
        const result = await ghIssue.list(input.repo, {
            state: 'open',
            assignee: '@me',
            limit: limits.tasks,
        });
        if (result.success && result.data) {
            context.activeTasks = result.data.map(issue => ({
                number: issue.number,
                title: issue.title,
                labels: issue.labels.map(l => l.name),
                priority: detectPriority(issue.labels),
                updatedAt: issue.updatedAt,
            }));
        }
    }
    // Fetch blockers
    if (include.includes('blockers')) {
        const result = await ghIssue.list(input.repo, {
            state: 'open',
            labels: ['blocker'],
            limit: 20,
        });
        if (result.success && result.data) {
            context.blockers = result.data.map(issue => ({
                number: issue.number,
                title: issue.title,
                blocking: extractBlockingIssues(issue.body || ''),
            }));
        }
    }
    // Fetch in-progress items
    if (include.includes('in_progress')) {
        const result = await ghIssue.list(input.repo, {
            state: 'open',
            labels: ['in-progress'],
            limit: 10,
        });
        if (result.success && result.data) {
            context.inProgress = result.data.map(issue => ({
                number: issue.number,
                title: issue.title,
                assignee: issue.assignees[0]?.login || 'unassigned',
                startedAt: issue.updatedAt,
            }));
        }
    }
    // Fetch open PRs
    if (include.includes('prs')) {
        const result = await ghPr.list(input.repo, 'open', limits.prs);
        if (result.success && result.data) {
            context.pullRequests = result.data.map(pr => ({
                number: pr.number,
                title: pr.title,
                author: pr.author.login,
                state: pr.state,
                reviewStatus: pr.reviewDecision || 'PENDING',
            }));
        }
    }
    // Recent comments requires GraphQL or iterating issues - simplified for now
    if (include.includes('recent_comments')) {
        // Get recent issue activity via search
        const result = await ghIssue.list(input.repo, {
            state: 'all',
            limit: limits.comments,
        });
        if (result.success && result.data) {
            // Extract latest comment from each issue
            const comments = [];
            for (const issue of result.data) {
                if (issue.comments && issue.comments.length > 0) {
                    const latest = issue.comments[issue.comments.length - 1];
                    comments.push({
                        issue: issue.number,
                        issueTitle: issue.title,
                        author: latest.author.login,
                        body: latest.body,
                        createdAt: latest.createdAt,
                    });
                }
            }
            // Sort by date and take most recent
            context.recentComments = comments
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, limits.comments);
        }
    }
    return {
        success: true,
        action: 'get',
        data: context,
        formatted: formatActiveContext(context),
    };
}
async function handleSetFocus(input) {
    if (!input.issue) {
        return { success: false, action: 'set_focus', error: 'Issue number is required' };
    }
    // Get issue details
    const result = await ghIssue.get(input.repo, input.issue);
    if (!result.success || !result.data) {
        return { success: false, action: 'set_focus', error: result.error || 'Issue not found' };
    }
    // Add 'focus' label if not present
    const hasLabel = result.data.labels.some(l => l.name.toLowerCase() === 'focus');
    if (!hasLabel) {
        await ghIssue.edit(input.repo, input.issue, {
            addLabels: ['focus'],
        });
    }
    return {
        success: true,
        action: 'set_focus',
        data: {
            number: result.data.number,
            title: result.data.title,
            url: result.data.url,
        },
        formatted: `\u{1F3AF} Focus set to #${input.issue}: ${result.data.title}`,
    };
}
async function handleGetBlockers(input) {
    const result = await ghIssue.list(input.repo, {
        state: 'open',
        labels: ['blocker'],
        limit: 50,
    });
    if (!result.success) {
        return { success: false, action: 'get_blockers', error: result.error };
    }
    const blockers = (result.data || []).map(issue => ({
        number: issue.number,
        title: issue.title,
        blocking: extractBlockingIssues(issue.body || ''),
    }));
    return {
        success: true,
        action: 'get_blockers',
        data: blockers,
        formatted: formatBlockers(blockers),
    };
}
async function handleGetTimeline(input) {
    // Get recent activity via issue list sorted by update
    const result = await ghIssue.list(input.repo, {
        state: 'all',
        limit: 20,
    });
    if (!result.success) {
        return { success: false, action: 'get_timeline', error: result.error };
    }
    const events = [];
    for (const issue of result.data || []) {
        // Add issue update event
        events.push({
            type: 'issue',
            issue: issue.number,
            title: issue.title,
            timestamp: issue.updatedAt,
        });
        // Add recent comments
        for (const comment of issue.comments.slice(-3)) {
            events.push({
                type: 'comment',
                issue: issue.number,
                title: issue.title,
                timestamp: comment.createdAt,
                actor: comment.author.login,
                content: comment.body.slice(0, 100),
            });
        }
    }
    // Sort by timestamp
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const formatted = events.slice(0, 20).map(e => {
        if (e.type === 'comment') {
            return `\u{1F4AC} #${e.issue} @${e.actor}: "${e.content?.slice(0, 50)}..."`;
        }
        return `\u{1F4CB} #${e.issue} ${e.title}`;
    }).join('\n');
    return {
        success: true,
        action: 'get_timeline',
        data: events.slice(0, 20),
        formatted: `\u{1F4C5} Recent Activity\n${'\u2500'.repeat(40)}\n${formatted}`,
    };
}
// Helpers
function detectPriority(labels) {
    const names = labels.map(l => l.name.toLowerCase());
    if (names.some(n => n.includes('critical') || n.includes('p0')))
        return 'critical';
    if (names.some(n => n.includes('high') || n.includes('p1')))
        return 'high';
    if (names.some(n => n.includes('medium') || n.includes('p2')))
        return 'medium';
    if (names.some(n => n.includes('low') || n.includes('p3')))
        return 'low';
    return 'none';
}
function extractBlockingIssues(body) {
    // Look for patterns like "blocks #123" or "blocking #456"
    const matches = body.match(/blocks?\s+#(\d+)/gi) || [];
    return matches.map(m => {
        const num = m.match(/\d+/);
        return num ? parseInt(num[0], 10) : 0;
    }).filter(n => n > 0);
}
//# sourceMappingURL=context.js.map