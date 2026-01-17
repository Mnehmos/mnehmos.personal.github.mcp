import { z } from 'zod';
export declare const LABEL_ALIASES: Record<string, string>;
export declare const STATE_ALIASES: Record<string, 'open' | 'closed'>;
export declare function normalizeLabel(label: string): string;
export declare function normalizeState(state: string): 'open' | 'closed';
export declare const IssueSchema: z.ZodObject<{
    number: z.ZodNumber;
    title: z.ZodString;
    body: z.ZodNullable<z.ZodString>;
    state: z.ZodEffects<z.ZodEnum<["open", "closed", "OPEN", "CLOSED"]>, "open" | "closed", "open" | "closed" | "OPEN" | "CLOSED">;
    url: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
    closedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    author: z.ZodOptional<z.ZodObject<{
        login: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        login: string;
    }, {
        login: string;
    }>>;
    assignees: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        login: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        login: string;
    }, {
        login: string;
    }>, "many">>>;
    labels: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
    }, {
        name: string;
    }>, "many">>>;
    milestone: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        title: z.ZodString;
        number: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        number: number;
        title: string;
    }, {
        number: number;
        title: string;
    }>>>;
    comments: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        author: z.ZodObject<{
            login: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            login: string;
        }, {
            login: string;
        }>;
        body: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        body: string;
        createdAt: string;
        author: {
            login: string;
        };
    }, {
        body: string;
        createdAt: string;
        author: {
            login: string;
        };
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    number: number;
    title: string;
    body: string | null;
    state: "open" | "closed";
    assignees: {
        login: string;
    }[];
    labels: {
        name: string;
    }[];
    comments: {
        body: string;
        createdAt: string;
        author: {
            login: string;
        };
    }[];
    url?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    closedAt?: string | null | undefined;
    author?: {
        login: string;
    } | undefined;
    milestone?: {
        number: number;
        title: string;
    } | null | undefined;
}, {
    number: number;
    title: string;
    body: string | null;
    state: "open" | "closed" | "OPEN" | "CLOSED";
    url?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    closedAt?: string | null | undefined;
    author?: {
        login: string;
    } | undefined;
    assignees?: {
        login: string;
    }[] | undefined;
    labels?: {
        name: string;
    }[] | undefined;
    milestone?: {
        number: number;
        title: string;
    } | null | undefined;
    comments?: {
        body: string;
        createdAt: string;
        author: {
            login: string;
        };
    }[] | undefined;
}>;
export type Issue = z.infer<typeof IssueSchema>;
export declare const GithubIssueInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "get", "update", "close", "reopen", "comment", "search", "list", "batch_update"]>;
    repo: z.ZodString;
    issue: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    labels: z.ZodEffects<z.ZodOptional<z.ZodArray<z.ZodString, "many">>, string[] | undefined, unknown>;
    assignees: z.ZodEffects<z.ZodOptional<z.ZodArray<z.ZodString, "many">>, string[] | undefined, unknown>;
    milestone: z.ZodOptional<z.ZodString>;
    reason: z.ZodDefault<z.ZodOptional<z.ZodEnum<["completed", "not_planned"]>>>;
    comment: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodObject<{
        state: z.ZodDefault<z.ZodOptional<z.ZodEnum<["open", "closed", "all"]>>>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        assignee: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        mentions: z.ZodOptional<z.ZodString>;
        milestone: z.ZodOptional<z.ZodString>;
        created: z.ZodOptional<z.ZodString>;
        updated: z.ZodOptional<z.ZodString>;
        sort: z.ZodDefault<z.ZodOptional<z.ZodEnum<["created", "updated", "comments"]>>>;
        order: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        state: "open" | "closed" | "all";
        sort: "comments" | "created" | "updated";
        order: "asc" | "desc";
        author?: string | undefined;
        labels?: string[] | undefined;
        milestone?: string | undefined;
        assignee?: string | undefined;
        mentions?: string | undefined;
        created?: string | undefined;
        updated?: string | undefined;
    }, {
        state?: "open" | "closed" | "all" | undefined;
        author?: string | undefined;
        labels?: string[] | undefined;
        milestone?: string | undefined;
        sort?: "comments" | "created" | "updated" | undefined;
        assignee?: string | undefined;
        mentions?: string | undefined;
        created?: string | undefined;
        updated?: string | undefined;
        order?: "asc" | "desc" | undefined;
    }>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    operations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        issue: z.ZodNumber;
        labels: z.ZodOptional<z.ZodObject<{
            add: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            remove: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            add?: string[] | undefined;
            remove?: string[] | undefined;
        }, {
            add?: string[] | undefined;
            remove?: string[] | undefined;
        }>>;
        assignees: z.ZodOptional<z.ZodObject<{
            add: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            remove: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            add?: string[] | undefined;
            remove?: string[] | undefined;
        }, {
            add?: string[] | undefined;
            remove?: string[] | undefined;
        }>>;
        state: z.ZodOptional<z.ZodEnum<["open", "closed"]>>;
        comment: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        issue: number;
        state?: "open" | "closed" | undefined;
        assignees?: {
            add?: string[] | undefined;
            remove?: string[] | undefined;
        } | undefined;
        labels?: {
            add?: string[] | undefined;
            remove?: string[] | undefined;
        } | undefined;
        comment?: string | undefined;
    }, {
        issue: number;
        state?: "open" | "closed" | undefined;
        assignees?: {
            add?: string[] | undefined;
            remove?: string[] | undefined;
        } | undefined;
        labels?: {
            add?: string[] | undefined;
            remove?: string[] | undefined;
        } | undefined;
        comment?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    action: "list" | "create" | "close" | "reopen" | "comment" | "search" | "get" | "update" | "batch_update";
    repo: string;
    reason: "completed" | "not_planned";
    limit: number;
    title?: string | undefined;
    body?: string | undefined;
    assignees?: string[] | undefined;
    labels?: string[] | undefined;
    milestone?: string | undefined;
    issue?: number | undefined;
    comment?: string | undefined;
    query?: string | undefined;
    filters?: {
        state: "open" | "closed" | "all";
        sort: "comments" | "created" | "updated";
        order: "asc" | "desc";
        author?: string | undefined;
        labels?: string[] | undefined;
        milestone?: string | undefined;
        assignee?: string | undefined;
        mentions?: string | undefined;
        created?: string | undefined;
        updated?: string | undefined;
    } | undefined;
    operations?: {
        issue: number;
        state?: "open" | "closed" | undefined;
        assignees?: {
            add?: string[] | undefined;
            remove?: string[] | undefined;
        } | undefined;
        labels?: {
            add?: string[] | undefined;
            remove?: string[] | undefined;
        } | undefined;
        comment?: string | undefined;
    }[] | undefined;
}, {
    action: "list" | "create" | "close" | "reopen" | "comment" | "search" | "get" | "update" | "batch_update";
    repo: string;
    title?: string | undefined;
    body?: string | undefined;
    assignees?: unknown;
    labels?: unknown;
    milestone?: string | undefined;
    issue?: number | undefined;
    comment?: string | undefined;
    reason?: "completed" | "not_planned" | undefined;
    query?: string | undefined;
    filters?: {
        state?: "open" | "closed" | "all" | undefined;
        author?: string | undefined;
        labels?: string[] | undefined;
        milestone?: string | undefined;
        sort?: "comments" | "created" | "updated" | undefined;
        assignee?: string | undefined;
        mentions?: string | undefined;
        created?: string | undefined;
        updated?: string | undefined;
        order?: "asc" | "desc" | undefined;
    } | undefined;
    limit?: number | undefined;
    operations?: {
        issue: number;
        state?: "open" | "closed" | undefined;
        assignees?: {
            add?: string[] | undefined;
            remove?: string[] | undefined;
        } | undefined;
        labels?: {
            add?: string[] | undefined;
            remove?: string[] | undefined;
        } | undefined;
        comment?: string | undefined;
    }[] | undefined;
}>;
export type GithubIssueInput = z.infer<typeof GithubIssueInputSchema>;
//# sourceMappingURL=issue.d.ts.map