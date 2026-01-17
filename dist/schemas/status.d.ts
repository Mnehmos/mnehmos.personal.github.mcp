import { z } from 'zod';
export declare const StatusSummarySchema: z.ZodObject<{
    assignedIssues: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        title: z.ZodString;
        repo: z.ZodString;
        url: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: number;
        title: string;
        url: string;
        updatedAt: string;
        repo: string;
    }, {
        number: number;
        title: string;
        url: string;
        updatedAt: string;
        repo: string;
    }>, "many">;
    assignedPRs: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        title: z.ZodString;
        repo: z.ZodString;
        url: z.ZodString;
        state: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: number;
        title: string;
        state: string;
        url: string;
        updatedAt: string;
        repo: string;
    }, {
        number: number;
        title: string;
        state: string;
        url: string;
        updatedAt: string;
        repo: string;
    }>, "many">;
    reviewRequests: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        title: z.ZodString;
        repo: z.ZodString;
        url: z.ZodString;
        author: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: number;
        title: string;
        url: string;
        author: string;
        repo: string;
    }, {
        number: number;
        title: string;
        url: string;
        author: string;
        repo: string;
    }>, "many">;
    mentions: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        title: z.ZodString;
        repo: z.ZodString;
        url: z.ZodString;
        type: z.ZodEnum<["issue", "pr"]>;
    }, "strip", z.ZodTypeAny, {
        number: number;
        title: string;
        url: string;
        type: "issue" | "pr";
        repo: string;
    }, {
        number: number;
        title: string;
        url: string;
        type: "issue" | "pr";
        repo: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    mentions: {
        number: number;
        title: string;
        url: string;
        type: "issue" | "pr";
        repo: string;
    }[];
    assignedIssues: {
        number: number;
        title: string;
        url: string;
        updatedAt: string;
        repo: string;
    }[];
    assignedPRs: {
        number: number;
        title: string;
        state: string;
        url: string;
        updatedAt: string;
        repo: string;
    }[];
    reviewRequests: {
        number: number;
        title: string;
        url: string;
        author: string;
        repo: string;
    }[];
}, {
    mentions: {
        number: number;
        title: string;
        url: string;
        type: "issue" | "pr";
        repo: string;
    }[];
    assignedIssues: {
        number: number;
        title: string;
        url: string;
        updatedAt: string;
        repo: string;
    }[];
    assignedPRs: {
        number: number;
        title: string;
        state: string;
        url: string;
        updatedAt: string;
        repo: string;
    }[];
    reviewRequests: {
        number: number;
        title: string;
        url: string;
        author: string;
        repo: string;
    }[];
}>;
export type StatusSummary = z.infer<typeof StatusSummarySchema>;
export declare const GithubStatusInputSchema: z.ZodObject<{
    action: z.ZodEnum<["get", "assigned", "review_requests", "mentions", "activity"]>;
    org: z.ZodOptional<z.ZodString>;
    exclude: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    include: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sections: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<["assigned_issues", "assigned_prs", "review_requests", "mentions", "activity"]>, "many">>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    action: "get" | "mentions" | "assigned" | "review_requests" | "activity";
    limit: number;
    sections: ("mentions" | "review_requests" | "activity" | "assigned_issues" | "assigned_prs")[];
    include?: string[] | undefined;
    org?: string | undefined;
    exclude?: string[] | undefined;
}, {
    action: "get" | "mentions" | "assigned" | "review_requests" | "activity";
    limit?: number | undefined;
    include?: string[] | undefined;
    org?: string | undefined;
    exclude?: string[] | undefined;
    sections?: ("mentions" | "review_requests" | "activity" | "assigned_issues" | "assigned_prs")[] | undefined;
}>;
export type GithubStatusInput = z.infer<typeof GithubStatusInputSchema>;
//# sourceMappingURL=status.d.ts.map