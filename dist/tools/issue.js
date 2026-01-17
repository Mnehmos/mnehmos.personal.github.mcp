/**
 * GitHub Issue tool implementation.
 * Composite operations for issue lifecycle management.
 */
import { ghIssue } from '../cli.js';
import { GithubIssueInputSchema, normalizeLabel } from '../schemas/issue.js';
import { formatIssue, formatIssueList, formatSearchResults } from '../formatters/issue.js';
/**
 * Main issue tool handler - dispatches to appropriate action.
 */
export async function handleIssueTool(input) {
    // Validate input
    const parsed = GithubIssueInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            action: input.action,
            error: `Validation error: ${parsed.error.message}`,
        };
    }
    const { action, repo } = parsed.data;
    switch (action) {
        case 'create':
            return handleCreate(parsed.data);
        case 'get':
            return handleGet(parsed.data);
        case 'update':
            return handleUpdate(parsed.data);
        case 'close':
            return handleClose(parsed.data);
        case 'reopen':
            return handleReopen(parsed.data);
        case 'comment':
            return handleComment(parsed.data);
        case 'search':
            return handleSearch(parsed.data);
        case 'list':
            return handleList(parsed.data);
        case 'batch_update':
            return handleBatchUpdate(parsed.data);
        default:
            return {
                success: false,
                action,
                error: `Unknown action: ${action}`,
            };
    }
}
async function handleCreate(input) {
    if (!input.title) {
        return { success: false, action: 'create', error: 'Title is required for create' };
    }
    // Normalize labels
    const labels = input.labels?.map(normalizeLabel);
    const result = await ghIssue.create(input.repo, {
        title: input.title,
        body: input.body,
        labels,
        assignees: input.assignees,
        milestone: input.milestone,
    });
    if (!result.success) {
        return { success: false, action: 'create', error: result.error };
    }
    return {
        success: true,
        action: 'create',
        data: result.data,
        formatted: `\u2705 Created issue #${result.data?.number}\n   ${result.data?.url}`,
    };
}
async function handleGet(input) {
    if (!input.issue) {
        return { success: false, action: 'get', error: 'Issue number is required' };
    }
    const result = await ghIssue.get(input.repo, input.issue);
    if (!result.success) {
        return { success: false, action: 'get', error: result.error };
    }
    return {
        success: true,
        action: 'get',
        data: result.data,
        formatted: result.data ? formatIssue(result.data) : undefined,
    };
}
async function handleUpdate(input) {
    if (!input.issue) {
        return { success: false, action: 'update', error: 'Issue number is required' };
    }
    // Normalize labels
    const addLabels = input.labels?.map(normalizeLabel);
    const result = await ghIssue.edit(input.repo, input.issue, {
        title: input.title,
        body: input.body,
        addLabels,
        addAssignees: input.assignees,
        milestone: input.milestone,
    });
    if (!result.success) {
        return { success: false, action: 'update', error: result.error };
    }
    return {
        success: true,
        action: 'update',
        formatted: `\u2705 Updated issue #${input.issue}`,
    };
}
async function handleClose(input) {
    if (!input.issue) {
        return { success: false, action: 'close', error: 'Issue number is required' };
    }
    const result = await ghIssue.close(input.repo, input.issue, input.reason, input.comment);
    if (!result.success) {
        return { success: false, action: 'close', error: result.error };
    }
    return {
        success: true,
        action: 'close',
        formatted: `\u2705 Closed issue #${input.issue} (${input.reason || 'completed'})`,
    };
}
async function handleReopen(input) {
    if (!input.issue) {
        return { success: false, action: 'reopen', error: 'Issue number is required' };
    }
    const result = await ghIssue.reopen(input.repo, input.issue);
    if (!result.success) {
        return { success: false, action: 'reopen', error: result.error };
    }
    return {
        success: true,
        action: 'reopen',
        formatted: `\u2705 Reopened issue #${input.issue}`,
    };
}
async function handleComment(input) {
    if (!input.issue) {
        return { success: false, action: 'comment', error: 'Issue number is required' };
    }
    if (!input.comment) {
        return { success: false, action: 'comment', error: 'Comment body is required' };
    }
    const result = await ghIssue.comment(input.repo, input.issue, input.comment);
    if (!result.success) {
        return { success: false, action: 'comment', error: result.error };
    }
    return {
        success: true,
        action: 'comment',
        formatted: `\u{1F4AC} Added comment to #${input.issue}`,
    };
}
async function handleSearch(input) {
    if (!input.query) {
        return { success: false, action: 'search', error: 'Query is required for search' };
    }
    const result = await ghIssue.search(input.repo, input.query, input.limit);
    if (!result.success) {
        return { success: false, action: 'search', error: result.error };
    }
    return {
        success: true,
        action: 'search',
        data: result.data,
        formatted: result.data ? formatSearchResults(result.data, input.query) : undefined,
    };
}
async function handleList(input) {
    const filters = input.filters;
    // Normalize labels in filters
    const normalizedLabels = filters?.labels?.map(normalizeLabel);
    const result = await ghIssue.list(input.repo, {
        state: filters?.state,
        labels: normalizedLabels,
        assignee: filters?.assignee,
        author: filters?.author,
        milestone: filters?.milestone,
        limit: input.limit,
    });
    if (!result.success) {
        return { success: false, action: 'list', error: result.error };
    }
    return {
        success: true,
        action: 'list',
        data: result.data,
        formatted: result.data ? formatIssueList(result.data) : undefined,
    };
}
async function handleBatchUpdate(input) {
    if (!input.operations || input.operations.length === 0) {
        return { success: false, action: 'batch_update', error: 'Operations array is required' };
    }
    const results = [];
    for (const op of input.operations) {
        try {
            // Apply label changes
            if (op.labels) {
                await ghIssue.edit(input.repo, op.issue, {
                    addLabels: op.labels.add?.map(normalizeLabel),
                    removeLabels: op.labels.remove?.map(normalizeLabel),
                });
            }
            // Apply assignee changes
            if (op.assignees) {
                await ghIssue.edit(input.repo, op.issue, {
                    addAssignees: op.assignees.add,
                    removeAssignees: op.assignees.remove,
                });
            }
            // Apply state change
            if (op.state === 'closed') {
                await ghIssue.close(input.repo, op.issue);
            }
            else if (op.state === 'open') {
                await ghIssue.reopen(input.repo, op.issue);
            }
            // Add comment
            if (op.comment) {
                await ghIssue.comment(input.repo, op.issue, op.comment);
            }
            results.push({ issue: op.issue, success: true });
        }
        catch (err) {
            results.push({ issue: op.issue, success: false, error: err.message });
        }
    }
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    return {
        success: failed === 0,
        action: 'batch_update',
        data: { results, summary: { total: results.length, successful, failed } },
        formatted: `\u{1F4E6} Batch update complete: ${successful}/${results.length} successful`,
    };
}
//# sourceMappingURL=issue.js.map