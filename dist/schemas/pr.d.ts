import { z } from "zod";
export declare const PrSchema: z.ZodObject<{
    number: z.ZodNumber;
    title: z.ZodString;
    body: z.ZodNullable<z.ZodString>;
    state: z.ZodString;
    url: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
    closedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mergedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
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
    headRefName: z.ZodOptional<z.ZodString>;
    baseRefName: z.ZodOptional<z.ZodString>;
    isDraft: z.ZodOptional<z.ZodBoolean>;
    mergeable: z.ZodOptional<z.ZodString>;
    reviewDecision: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    additions: z.ZodOptional<z.ZodNumber>;
    deletions: z.ZodOptional<z.ZodNumber>;
    changedFiles: z.ZodOptional<z.ZodNumber>;
    commits: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodAny, "many">>>;
    reviews: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        author: z.ZodObject<{
            login: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            login: string;
        }, {
            login: string;
        }>;
        state: z.ZodString;
        body: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        body: string;
        state: string;
        author: {
            login: string;
        };
    }, {
        body: string;
        state: string;
        author: {
            login: string;
        };
    }>, "many">>>;
    statusCheckRollup: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        status: z.ZodString;
        conclusion: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: string;
        name: string;
        conclusion: string | null;
    }, {
        status: string;
        name: string;
        conclusion: string | null;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    number: number;
    title: string;
    body: string | null;
    state: string;
    url: string;
    assignees: {
        login: string;
    }[];
    labels: {
        name: string;
    }[];
    commits: any[];
    reviews: {
        body: string;
        state: string;
        author: {
            login: string;
        };
    }[];
    statusCheckRollup: {
        status: string;
        name: string;
        conclusion: string | null;
    }[];
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
    mergedAt?: string | null | undefined;
    headRefName?: string | undefined;
    baseRefName?: string | undefined;
    isDraft?: boolean | undefined;
    mergeable?: string | undefined;
    reviewDecision?: string | null | undefined;
    additions?: number | undefined;
    deletions?: number | undefined;
    changedFiles?: number | undefined;
}, {
    number: number;
    title: string;
    body: string | null;
    state: string;
    url: string;
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
    mergedAt?: string | null | undefined;
    headRefName?: string | undefined;
    baseRefName?: string | undefined;
    isDraft?: boolean | undefined;
    mergeable?: string | undefined;
    reviewDecision?: string | null | undefined;
    additions?: number | undefined;
    deletions?: number | undefined;
    changedFiles?: number | undefined;
    commits?: any[] | undefined;
    reviews?: {
        body: string;
        state: string;
        author: {
            login: string;
        };
    }[] | undefined;
    statusCheckRollup?: {
        status: string;
        name: string;
        conclusion: string | null;
    }[] | undefined;
}>;
export type Pr = z.infer<typeof PrSchema>;
export declare const GithubPrInputSchema: z.ZodObject<{
    action: z.ZodEnum<["list", "get", "create", "merge", "close", "reopen", "ready", "review", "diff", "checks", "comment"]>;
    repo: z.ZodString;
    pr: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    head: z.ZodOptional<z.ZodString>;
    base: z.ZodOptional<z.ZodString>;
    draft: z.ZodOptional<z.ZodBoolean>;
    method: z.ZodDefault<z.ZodOptional<z.ZodEnum<["merge", "squash", "rebase"]>>>;
    deleteAfterMerge: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    event: z.ZodOptional<z.ZodEnum<["approve", "comment", "request_changes"]>>;
    reviewBody: z.ZodOptional<z.ZodString>;
    comment: z.ZodOptional<z.ZodString>;
    state: z.ZodDefault<z.ZodOptional<z.ZodEnum<["open", "closed", "merged", "all"]>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    assignees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    reviewers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    state: "open" | "closed" | "all" | "merged";
    action: "list" | "create" | "close" | "reopen" | "comment" | "get" | "merge" | "ready" | "review" | "diff" | "checks";
    repo: string;
    limit: number;
    method: "merge" | "squash" | "rebase";
    deleteAfterMerge: boolean;
    title?: string | undefined;
    body?: string | undefined;
    assignees?: string[] | undefined;
    labels?: string[] | undefined;
    comment?: string | undefined;
    pr?: number | undefined;
    head?: string | undefined;
    base?: string | undefined;
    draft?: boolean | undefined;
    event?: "comment" | "approve" | "request_changes" | undefined;
    reviewBody?: string | undefined;
    reviewers?: string[] | undefined;
}, {
    action: "list" | "create" | "close" | "reopen" | "comment" | "get" | "merge" | "ready" | "review" | "diff" | "checks";
    repo: string;
    title?: string | undefined;
    body?: string | undefined;
    state?: "open" | "closed" | "all" | "merged" | undefined;
    assignees?: string[] | undefined;
    labels?: string[] | undefined;
    comment?: string | undefined;
    pr?: number | undefined;
    limit?: number | undefined;
    head?: string | undefined;
    base?: string | undefined;
    draft?: boolean | undefined;
    method?: "merge" | "squash" | "rebase" | undefined;
    deleteAfterMerge?: boolean | undefined;
    event?: "comment" | "approve" | "request_changes" | undefined;
    reviewBody?: string | undefined;
    reviewers?: string[] | undefined;
}>;
export type GithubPrInput = z.infer<typeof GithubPrInputSchema>;
//# sourceMappingURL=pr.d.ts.map