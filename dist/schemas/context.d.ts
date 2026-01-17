import { z } from 'zod';
export declare const GithubContextInputSchema: z.ZodObject<{
    action: z.ZodEnum<["get", "set_focus", "get_blockers", "get_timeline"]>;
    repo: z.ZodString;
    issue: z.ZodOptional<z.ZodNumber>;
    include: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<["active_tasks", "blockers", "recent_comments", "in_progress", "milestones", "prs", "recent_closed"]>, "many">>>, ("active_tasks" | "blockers" | "recent_comments" | "in_progress" | "milestones" | "prs" | "recent_closed")[], unknown>;
    limit: z.ZodOptional<z.ZodObject<{
        tasks: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        comments: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        prs: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        closed: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        comments: number;
        closed: number;
        prs: number;
        tasks: number;
    }, {
        comments?: number | undefined;
        closed?: number | undefined;
        prs?: number | undefined;
        tasks?: number | undefined;
    }>>;
    since: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "get" | "set_focus" | "get_blockers" | "get_timeline";
    repo: string;
    include: ("active_tasks" | "blockers" | "recent_comments" | "in_progress" | "milestones" | "prs" | "recent_closed")[];
    issue?: number | undefined;
    limit?: {
        comments: number;
        closed: number;
        prs: number;
        tasks: number;
    } | undefined;
    since?: string | undefined;
}, {
    action: "get" | "set_focus" | "get_blockers" | "get_timeline";
    repo: string;
    issue?: number | undefined;
    limit?: {
        comments?: number | undefined;
        closed?: number | undefined;
        prs?: number | undefined;
        tasks?: number | undefined;
    } | undefined;
    include?: unknown;
    since?: string | undefined;
}>;
export type GithubContextInput = z.infer<typeof GithubContextInputSchema>;
export interface ActiveContext {
    repo: string;
    timestamp: string;
    currentFocus: {
        number: number;
        title: string;
        url: string;
    } | null;
    activeTasks: Array<{
        number: number;
        title: string;
        labels: string[];
        priority: 'critical' | 'high' | 'medium' | 'low' | 'none';
        updatedAt: string;
    }>;
    blockers: Array<{
        number: number;
        title: string;
        blocking: number[];
    }>;
    inProgress: Array<{
        number: number;
        title: string;
        assignee: string;
        startedAt: string;
    }>;
    recentComments: Array<{
        issue: number;
        issueTitle: string;
        author: string;
        body: string;
        createdAt: string;
    }>;
    milestones: Array<{
        title: string;
        progress: {
            open: number;
            closed: number;
        };
        dueOn: string | null;
    }>;
    pullRequests: Array<{
        number: number;
        title: string;
        author: string;
        state: string;
        reviewStatus: string;
    }>;
}
//# sourceMappingURL=context.d.ts.map