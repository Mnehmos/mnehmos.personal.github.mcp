/**
 * GitHub CLI (gh) wrapper with structured output and error handling.
 * All GitHub operations go through this layer.
 */
import { execSync, exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
const DEFAULT_OPTIONS = {
    timeout: 30000,
    maxBuffer: 10 * 1024 * 1024, // 10MB
};
/**
 * Execute a gh CLI command and return structured result.
 */
export async function gh(args, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    // Quote args that contain spaces for proper shell handling
    const quotedArgs = args.map(arg => arg.includes(' ') || arg.includes('"') ? `"${arg.replace(/"/g, '\\"')}"` : arg);
    const command = `gh ${quotedArgs.join(' ')}`;
    try {
        const { stdout, stderr } = await execAsync(command, {
            timeout: opts.timeout,
            maxBuffer: opts.maxBuffer,
            cwd: opts.cwd,
            encoding: 'utf8',
        });
        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(stdout);
        }
        catch {
            data = stdout.trim();
        }
        return {
            success: true,
            data,
            stderr: stderr || undefined,
            command,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            stderr: error.stderr?.toString(),
            command,
        };
    }
}
/**
 * Synchronous version for simple operations.
 */
export function ghSync(args, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const command = `gh ${args.join(' ')}`;
    try {
        const stdout = execSync(command, {
            timeout: opts.timeout,
            maxBuffer: opts.maxBuffer,
            cwd: opts.cwd,
            encoding: 'utf8',
        });
        let data;
        try {
            data = JSON.parse(stdout);
        }
        catch {
            data = stdout.trim();
        }
        return { success: true, data, command };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            stderr: error.stderr?.toString(),
            command,
        };
    }
}
const ISSUE_JSON_FIELDS = [
    'number', 'title', 'body', 'state', 'url',
    'createdAt', 'updatedAt', 'closedAt',
    'author', 'assignees', 'labels', 'milestone', 'comments'
].join(',');
export const ghIssue = {
    /**
     * List issues with filters.
     */
    list: (repo, filters = {}) => {
        const args = ['issue', 'list', '-R', repo, '--json', ISSUE_JSON_FIELDS];
        if (filters.state)
            args.push('--state', filters.state);
        if (filters.assignee)
            args.push('--assignee', filters.assignee);
        if (filters.author)
            args.push('--author', filters.author);
        if (filters.milestone)
            args.push('--milestone', filters.milestone);
        if (filters.labels?.length) {
            filters.labels.forEach(l => args.push('--label', l));
        }
        if (filters.search)
            args.push('--search', filters.search);
        if (filters.limit)
            args.push('--limit', String(filters.limit));
        return gh(args);
    },
    /**
     * Get a single issue with full details.
     */
    get: (repo, number) => {
        return gh([
            'issue', 'view', '-R', repo, String(number),
            '--json', ISSUE_JSON_FIELDS
        ]);
    },
    /**
     * Create a new issue.
     */
    create: (repo, params) => {
        const args = ['issue', 'create', '-R', repo, '--title', params.title];
        if (params.body)
            args.push('--body', params.body);
        if (params.labels?.length) {
            params.labels.forEach(l => args.push('--label', l));
        }
        if (params.assignees?.length) {
            params.assignees.forEach(a => args.push('--assignee', a));
        }
        if (params.milestone)
            args.push('--milestone', params.milestone);
        args.push('--json', 'number,url');
        return gh(args);
    },
    /**
     * Update an issue.
     */
    edit: (repo, number, params) => {
        const args = ['issue', 'edit', '-R', repo, String(number)];
        if (params.title)
            args.push('--title', params.title);
        if (params.body)
            args.push('--body', params.body);
        if (params.addLabels?.length) {
            args.push('--add-label', params.addLabels.join(','));
        }
        if (params.removeLabels?.length) {
            args.push('--remove-label', params.removeLabels.join(','));
        }
        if (params.addAssignees?.length) {
            args.push('--add-assignee', params.addAssignees.join(','));
        }
        if (params.removeAssignees?.length) {
            args.push('--remove-assignee', params.removeAssignees.join(','));
        }
        if (params.milestone)
            args.push('--milestone', params.milestone);
        return gh(args);
    },
    /**
     * Close an issue.
     */
    close: (repo, number, reason, comment) => {
        const args = ['issue', 'close', '-R', repo, String(number)];
        if (reason)
            args.push('--reason', reason);
        if (comment)
            args.push('--comment', comment);
        return gh(args);
    },
    /**
     * Reopen an issue.
     */
    reopen: (repo, number) => {
        return gh(['issue', 'reopen', '-R', repo, String(number)]);
    },
    /**
     * Add a comment.
     */
    comment: (repo, number, body) => {
        return gh(['issue', 'comment', '-R', repo, String(number), '--body', body]);
    },
    /**
     * Search issues.
     */
    search: (repo, query, limit = 30) => {
        return gh([
            'search', 'issues',
            '--repo', repo,
            '--json', ISSUE_JSON_FIELDS,
            '--limit', String(limit),
            query
        ]);
    },
};
// ============================================================================
// Project Operations
// ============================================================================
export const ghProject = {
    /**
     * List projects for a repo or org.
     */
    list: (owner) => {
        return gh([
            'project', 'list', '--owner', owner, '--format', 'json'
        ]);
    },
    /**
     * Get project items.
     */
    items: (owner, projectNumber) => {
        return gh([
            'project', 'item-list', String(projectNumber),
            '--owner', owner, '--format', 'json'
        ]);
    },
    /**
     * Add item to project.
     */
    addItem: (owner, projectNumber, issueUrl) => {
        return gh([
            'project', 'item-add', String(projectNumber),
            '--owner', owner, '--url', issueUrl, '--format', 'json'
        ]);
    },
};
// ============================================================================
// PR Operations
// ============================================================================
export const ghPr = {
    /**
     * List pull requests.
     */
    list: (repo, state = 'open', limit = 10) => {
        return gh([
            'pr', 'list', '-R', repo,
            '--state', state,
            '--limit', String(limit),
            '--json', 'number,title,author,state,url,reviewDecision'
        ]);
    },
};
// ============================================================================
// Auth & User Operations
// ============================================================================
export const ghAuth = {
    /**
     * Get current authenticated user.
     */
    status: () => gh(['auth', 'status']),
    /**
     * Get logged in username.
     */
    whoami: () => gh(['api', 'user', '-q', '.login']),
};
// ============================================================================
// API Operations (for complex queries)
// ============================================================================
export const ghApi = {
    /**
     * Execute GraphQL query.
     */
    graphql: (query, variables) => {
        const args = ['api', 'graphql', '-f', `query=${query}`];
        if (variables) {
            Object.entries(variables).forEach(([key, value]) => {
                args.push('-F', `${key}=${JSON.stringify(value)}`);
            });
        }
        return gh(args);
    },
    /**
     * Execute REST API call.
     */
    rest: (endpoint, method = 'GET', data) => {
        const args = ['api', endpoint, '-X', method];
        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                args.push('-f', `${key}=${value}`);
            });
        }
        return gh(args);
    },
};
//# sourceMappingURL=cli.js.map