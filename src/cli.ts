/**
 * GitHub CLI (gh) wrapper with structured output and error handling.
 * All GitHub operations go through this layer.
 */

import { execSync, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GhResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  stderr?: string;
  command?: string;
}

export interface GhOptions {
  timeout?: number;
  maxBuffer?: number;
  cwd?: string;
}

const DEFAULT_OPTIONS: GhOptions = {
  timeout: 30000,
  maxBuffer: 10 * 1024 * 1024, // 10MB
};

/**
 * Execute a gh CLI command and return structured result.
 */
export async function gh<T>(
  args: string[],
  options: GhOptions = {}
): Promise<GhResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Quote args that contain spaces for proper shell handling
  const quotedArgs = args.map(arg => 
    arg.includes(' ') || arg.includes('"') ? `"${arg.replace(/"/g, '\\"')}"` : arg
  );
  const command = `gh ${quotedArgs.join(' ')}`;

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: opts.timeout,
      maxBuffer: opts.maxBuffer,
      cwd: opts.cwd,
      encoding: 'utf8',
    });

    // Try to parse as JSON
    let data: T;
    try {
      data = JSON.parse(stdout);
    } catch {
      data = stdout.trim() as unknown as T;
    }

    return {
      success: true,
      data,
      stderr: stderr || undefined,
      command,
    };
  } catch (error: any) {
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
export function ghSync<T>(args: string[], options: GhOptions = {}): GhResult<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const command = `gh ${args.join(' ')}`;

  try {
    const stdout = execSync(command, {
      timeout: opts.timeout,
      maxBuffer: opts.maxBuffer,
      cwd: opts.cwd,
      encoding: 'utf8',
    });

    let data: T;
    try {
      data = JSON.parse(stdout);
    } catch {
      data = stdout.trim() as unknown as T;
    }

    return { success: true, data, command };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.toString(),
      command,
    };
  }
}

// ============================================================================
// Issue Operations
// ============================================================================

export interface IssueJson {
  number: number;
  title: string;
  body: string | null;
  state: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  author: { login: string };
  assignees: Array<{ login: string }>;
  labels: Array<{ name: string }>;
  milestone: { title: string; number: number } | null;
  comments: Array<{
    author: { login: string };
    body: string;
    createdAt: string;
  }>;
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
  list: (repo: string, filters: {
    state?: 'open' | 'closed' | 'all';
    labels?: string[];
    assignee?: string;
    author?: string;
    milestone?: string;
    search?: string;
    limit?: number;
  } = {}) => {
    const args = ['issue', 'list', '-R', repo, '--json', ISSUE_JSON_FIELDS];

    if (filters.state) args.push('--state', filters.state);
    if (filters.assignee) args.push('--assignee', filters.assignee);
    if (filters.author) args.push('--author', filters.author);
    if (filters.milestone) args.push('--milestone', filters.milestone);
    if (filters.labels?.length) {
      filters.labels.forEach(l => args.push('--label', l));
    }
    if (filters.search) args.push('--search', filters.search);
    if (filters.limit) args.push('--limit', String(filters.limit));

    return gh<IssueJson[]>(args);
  },

  /**
   * Get a single issue with full details.
   */
  get: (repo: string, number: number) => {
    return gh<IssueJson>([
      'issue', 'view', '-R', repo, String(number),
      '--json', ISSUE_JSON_FIELDS
    ]);
  },

  /**
   * Create a new issue.
   */
  create: (repo: string, params: {
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
    milestone?: string;
  }) => {
    const args = ['issue', 'create', '-R', repo, '--title', params.title];

    if (params.body) args.push('--body', params.body);
    if (params.labels?.length) {
      params.labels.forEach(l => args.push('--label', l));
    }
    if (params.assignees?.length) {
      params.assignees.forEach(a => args.push('--assignee', a));
    }
    if (params.milestone) args.push('--milestone', params.milestone);

    args.push('--json', 'number,url');
    return gh<{ number: number; url: string }>(args);
  },

  /**
   * Update an issue.
   */
  edit: (repo: string, number: number, params: {
    title?: string;
    body?: string;
    addLabels?: string[];
    removeLabels?: string[];
    addAssignees?: string[];
    removeAssignees?: string[];
    milestone?: string;
  }) => {
    const args = ['issue', 'edit', '-R', repo, String(number)];

    if (params.title) args.push('--title', params.title);
    if (params.body) args.push('--body', params.body);
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
    if (params.milestone) args.push('--milestone', params.milestone);

    return gh<string>(args);
  },

  /**
   * Close an issue.
   */
  close: (repo: string, number: number, reason?: 'completed' | 'not_planned', comment?: string) => {
    const args = ['issue', 'close', '-R', repo, String(number)];
    if (reason) args.push('--reason', reason);
    if (comment) args.push('--comment', comment);
    return gh<string>(args);
  },

  /**
   * Reopen an issue.
   */
  reopen: (repo: string, number: number) => {
    return gh<string>(['issue', 'reopen', '-R', repo, String(number)]);
  },

  /**
   * Add a comment.
   */
  comment: (repo: string, number: number, body: string) => {
    return gh<string>(['issue', 'comment', '-R', repo, String(number), '--body', body]);
  },

  /**
   * Search issues.
   */
  search: (repo: string, query: string, limit = 30) => {
    return gh<IssueJson[]>([
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
  list: (owner: string) => {
    return gh<Array<{ number: number; title: string; url: string }>>([
      'project', 'list', '--owner', owner, '--format', 'json'
    ]);
  },

  /**
   * Get project items.
   */
  items: (owner: string, projectNumber: number) => {
    return gh<any>([
      'project', 'item-list', String(projectNumber),
      '--owner', owner, '--format', 'json'
    ]);
  },

  /**
   * Add item to project.
   */
  addItem: (owner: string, projectNumber: number, issueUrl: string) => {
    return gh<{ id: string }>([
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
  list: (repo: string, state: 'open' | 'closed' | 'merged' | 'all' = 'open', limit = 10) => {
    return gh<Array<{
      number: number;
      title: string;
      author: { login: string };
      state: string;
      url: string;
      reviewDecision: string;
    }>>([
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
  status: () => gh<string>(['auth', 'status']),

  /**
   * Get logged in username.
   */
  whoami: () => gh<string>(['api', 'user', '-q', '.login']),
};

// ============================================================================
// API Operations (for complex queries)
// ============================================================================

export const ghApi = {
  /**
   * Execute GraphQL query.
   */
  graphql: <T>(query: string, variables?: Record<string, any>) => {
    const args = ['api', 'graphql', '-f', `query=${query}`];
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        args.push('-F', `${key}=${JSON.stringify(value)}`);
      });
    }
    return gh<T>(args);
  },

  /**
   * Execute REST API call.
   */
  rest: <T>(endpoint: string, method = 'GET', data?: Record<string, any>) => {
    const args = ['api', endpoint, '-X', method];
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        args.push('-f', `${key}=${value}`);
      });
    }
    return gh<T>(args);
  },
};
