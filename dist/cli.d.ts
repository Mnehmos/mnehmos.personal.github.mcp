/**
 * GitHub CLI (gh) wrapper with structured output and error handling.
 * All GitHub operations go through this layer.
 */
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
/**
 * Execute a gh CLI command and return structured result.
 */
export declare function gh<T>(args: string[], options?: GhOptions): Promise<GhResult<T>>;
/**
 * Synchronous version for simple operations.
 */
export declare function ghSync<T>(args: string[], options?: GhOptions): GhResult<T>;
export interface IssueJson {
    number: number;
    title: string;
    body: string | null;
    state: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    closedAt: string | null;
    author: {
        login: string;
    };
    assignees: Array<{
        login: string;
    }>;
    labels: Array<{
        name: string;
    }>;
    milestone: {
        title: string;
        number: number;
    } | null;
    comments: Array<{
        author: {
            login: string;
        };
        body: string;
        createdAt: string;
    }>;
}
export declare const ghIssue: {
    /**
     * List issues with filters.
     */
    list: (repo: string, filters?: {
        state?: "open" | "closed" | "all";
        labels?: string[];
        assignee?: string;
        author?: string;
        milestone?: string;
        search?: string;
        limit?: number;
    }) => Promise<GhResult<IssueJson[]>>;
    /**
     * Get a single issue with full details.
     */
    get: (repo: string, number: number) => Promise<GhResult<IssueJson>>;
    /**
     * Create a new issue.
     */
    create: (repo: string, params: {
        title: string;
        body?: string;
        labels?: string[];
        assignees?: string[];
        milestone?: string;
    }) => Promise<GhResult<{
        number: number;
        url: string;
    }>>;
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
    }) => Promise<GhResult<string>>;
    /**
     * Close an issue.
     */
    close: (repo: string, number: number, reason?: "completed" | "not_planned", comment?: string) => Promise<GhResult<string>>;
    /**
     * Reopen an issue.
     */
    reopen: (repo: string, number: number) => Promise<GhResult<string>>;
    /**
     * Add a comment.
     */
    comment: (repo: string, number: number, body: string) => Promise<GhResult<string>>;
    /**
     * Search issues.
     */
    search: (repo: string, query: string, limit?: number) => Promise<GhResult<IssueJson[]>>;
};
export declare const ghProject: {
    /**
     * List projects for a repo or org.
     */
    list: (owner: string) => Promise<GhResult<{
        number: number;
        title: string;
        url: string;
    }[]>>;
    /**
     * Get project items.
     */
    items: (owner: string, projectNumber: number) => Promise<GhResult<any>>;
    /**
     * Add item to project.
     */
    addItem: (owner: string, projectNumber: number, issueUrl: string) => Promise<GhResult<{
        id: string;
    }>>;
};
export declare const ghPr: {
    /**
     * List pull requests.
     */
    list: (repo: string, state?: "open" | "closed" | "merged" | "all", limit?: number) => Promise<GhResult<{
        number: number;
        title: string;
        author: {
            login: string;
        };
        state: string;
        url: string;
        reviewDecision: string;
    }[]>>;
};
export declare const ghAuth: {
    /**
     * Get current authenticated user.
     */
    status: () => Promise<GhResult<string>>;
    /**
     * Get logged in username.
     */
    whoami: () => Promise<GhResult<string>>;
};
export declare const ghApi: {
    /**
     * Execute GraphQL query.
     */
    graphql: <T>(query: string, variables?: Record<string, any>) => Promise<GhResult<T>>;
    /**
     * Execute REST API call.
     */
    rest: <T>(endpoint: string, method?: string, data?: Record<string, any>) => Promise<GhResult<T>>;
};
//# sourceMappingURL=cli.d.ts.map