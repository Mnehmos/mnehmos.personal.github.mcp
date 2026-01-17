import { z } from 'zod';
export declare const SearchIssueSchema: z.ZodObject<{
    number: z.ZodNumber;
    title: z.ZodString;
    state: z.ZodString;
    url: z.ZodString;
    repository: z.ZodObject<{
        nameWithOwner: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        nameWithOwner: string;
    }, {
        nameWithOwner: string;
    }>;
    author: z.ZodOptional<z.ZodObject<{
        login: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        login: string;
    }, {
        login: string;
    }>>;
    labels: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
    }, {
        name: string;
    }>, "many">>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    commentsCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    number: number;
    title: string;
    state: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    labels: {
        name: string;
    }[];
    repository: {
        nameWithOwner: string;
    };
    author?: {
        login: string;
    } | undefined;
    commentsCount?: number | undefined;
}, {
    number: number;
    title: string;
    state: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    repository: {
        nameWithOwner: string;
    };
    author?: {
        login: string;
    } | undefined;
    labels?: {
        name: string;
    }[] | undefined;
    commentsCount?: number | undefined;
}>;
export declare const SearchRepoSchema: z.ZodObject<{
    name: z.ZodString;
    fullName: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    url: z.ZodString;
    stargazerCount: z.ZodNumber;
    forkCount: z.ZodNumber;
    language: z.ZodNullable<z.ZodString>;
    isPrivate: z.ZodBoolean;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
    updatedAt: string;
    name: string;
    description: string | null;
    fullName: string;
    stargazerCount: number;
    forkCount: number;
    language: string | null;
    isPrivate: boolean;
}, {
    url: string;
    updatedAt: string;
    name: string;
    description: string | null;
    fullName: string;
    stargazerCount: number;
    forkCount: number;
    language: string | null;
    isPrivate: boolean;
}>;
export declare const SearchCodeSchema: z.ZodObject<{
    path: z.ZodString;
    repository: z.ZodObject<{
        nameWithOwner: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        nameWithOwner: string;
    }, {
        nameWithOwner: string;
    }>;
    textMatches: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        fragment: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fragment: string;
    }, {
        fragment: string;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    repository: {
        nameWithOwner: string;
    };
    textMatches: {
        fragment: string;
    }[];
}, {
    path: string;
    repository: {
        nameWithOwner: string;
    };
    textMatches?: {
        fragment: string;
    }[] | undefined;
}>;
export declare const SearchCommitSchema: z.ZodObject<{
    sha: z.ZodString;
    message: z.ZodString;
    author: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        date: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        date: string;
        name: string;
        email: string;
    }, {
        date: string;
        name: string;
        email: string;
    }>;
    repository: z.ZodObject<{
        nameWithOwner: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        nameWithOwner: string;
    }, {
        nameWithOwner: string;
    }>;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
    author: {
        date: string;
        name: string;
        email: string;
    };
    message: string;
    repository: {
        nameWithOwner: string;
    };
    sha: string;
}, {
    url: string;
    author: {
        date: string;
        name: string;
        email: string;
    };
    message: string;
    repository: {
        nameWithOwner: string;
    };
    sha: string;
}>;
export declare const GithubSearchInputSchema: z.ZodObject<{
    action: z.ZodEnum<["issues", "prs", "repos", "code", "commits"]>;
    query: z.ZodString;
    repo: z.ZodOptional<z.ZodString>;
    owner: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodEnum<["open", "closed", "all"]>>;
    author: z.ZodOptional<z.ZodString>;
    assignee: z.ZodOptional<z.ZodString>;
    mentions: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    created: z.ZodOptional<z.ZodString>;
    updated: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodEnum<["created", "updated", "comments", "reactions", "stars", "forks", "best-match", "author-date", "committer-date"]>>;
    order: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    action: "issues" | "code" | "prs" | "commits" | "repos";
    query: string;
    order: "asc" | "desc";
    limit: number;
    state?: "open" | "closed" | "all" | undefined;
    author?: string | undefined;
    sort?: "comments" | "created" | "updated" | "reactions" | "stars" | "forks" | "best-match" | "author-date" | "committer-date" | undefined;
    repo?: string | undefined;
    assignee?: string | undefined;
    mentions?: string | undefined;
    created?: string | undefined;
    updated?: string | undefined;
    language?: string | undefined;
    owner?: string | undefined;
    label?: string[] | undefined;
}, {
    action: "issues" | "code" | "prs" | "commits" | "repos";
    query: string;
    state?: "open" | "closed" | "all" | undefined;
    author?: string | undefined;
    sort?: "comments" | "created" | "updated" | "reactions" | "stars" | "forks" | "best-match" | "author-date" | "committer-date" | undefined;
    repo?: string | undefined;
    assignee?: string | undefined;
    mentions?: string | undefined;
    created?: string | undefined;
    updated?: string | undefined;
    order?: "asc" | "desc" | undefined;
    limit?: number | undefined;
    language?: string | undefined;
    owner?: string | undefined;
    label?: string[] | undefined;
}>;
export type GithubSearchInput = z.infer<typeof GithubSearchInputSchema>;
//# sourceMappingURL=search.d.ts.map