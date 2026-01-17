import { z } from 'zod';
export declare const WorkflowRunSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    displayTitle: z.ZodOptional<z.ZodString>;
    headBranch: z.ZodString;
    headSha: z.ZodString;
    status: z.ZodString;
    conclusion: z.ZodNullable<z.ZodString>;
    event: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    url: z.ZodString;
    actor: z.ZodOptional<z.ZodObject<{
        login: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        login: string;
    }, {
        login: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    name: string;
    conclusion: string | null;
    event: string;
    id: number;
    headBranch: string;
    headSha: string;
    displayTitle?: string | undefined;
    actor?: {
        login: string;
    } | undefined;
}, {
    url: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    name: string;
    conclusion: string | null;
    event: string;
    id: number;
    headBranch: string;
    headSha: string;
    displayTitle?: string | undefined;
    actor?: {
        login: string;
    } | undefined;
}>;
export type WorkflowRun = z.infer<typeof WorkflowRunSchema>;
export declare const WorkflowSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    path: z.ZodString;
    state: z.ZodString;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    state: string;
    url: string;
    path: string;
    name: string;
    id: number;
}, {
    state: string;
    url: string;
    path: string;
    name: string;
    id: number;
}>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export declare const JobSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    status: z.ZodString;
    conclusion: z.ZodNullable<z.ZodString>;
    startedAt: z.ZodNullable<z.ZodString>;
    completedAt: z.ZodNullable<z.ZodString>;
    steps: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        status: z.ZodString;
        conclusion: z.ZodNullable<z.ZodString>;
        number: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        number: number;
        status: string;
        name: string;
        conclusion: string | null;
    }, {
        number: number;
        status: string;
        name: string;
        conclusion: string | null;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status: string;
    name: string;
    conclusion: string | null;
    id: number;
    startedAt: string | null;
    completedAt: string | null;
    steps?: {
        number: number;
        status: string;
        name: string;
        conclusion: string | null;
    }[] | undefined;
}, {
    status: string;
    name: string;
    conclusion: string | null;
    id: number;
    startedAt: string | null;
    completedAt: string | null;
    steps?: {
        number: number;
        status: string;
        name: string;
        conclusion: string | null;
    }[] | undefined;
}>;
export type Job = z.infer<typeof JobSchema>;
export declare const GithubActionsInputSchema: z.ZodObject<{
    action: z.ZodEnum<["list_workflows", "list_runs", "get_run", "run", "cancel", "rerun", "rerun_failed", "list_jobs", "get_logs"]>;
    repo: z.ZodString;
    runId: z.ZodOptional<z.ZodNumber>;
    workflow: z.ZodOptional<z.ZodString>;
    ref: z.ZodOptional<z.ZodString>;
    inputs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    branch: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["queued", "in_progress", "completed", "waiting", "requested", "pending"]>>;
    event: z.ZodOptional<z.ZodString>;
    jobId: z.ZodOptional<z.ZodNumber>;
    tailLines: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    action: "list_workflows" | "list_runs" | "get_run" | "run" | "cancel" | "rerun" | "rerun_failed" | "list_jobs" | "get_logs";
    repo: string;
    limit: number;
    tailLines: number;
    status?: "completed" | "in_progress" | "queued" | "waiting" | "requested" | "pending" | undefined;
    event?: string | undefined;
    runId?: number | undefined;
    workflow?: string | undefined;
    ref?: string | undefined;
    inputs?: Record<string, string> | undefined;
    branch?: string | undefined;
    jobId?: number | undefined;
}, {
    action: "list_workflows" | "list_runs" | "get_run" | "run" | "cancel" | "rerun" | "rerun_failed" | "list_jobs" | "get_logs";
    repo: string;
    status?: "completed" | "in_progress" | "queued" | "waiting" | "requested" | "pending" | undefined;
    limit?: number | undefined;
    event?: string | undefined;
    runId?: number | undefined;
    workflow?: string | undefined;
    ref?: string | undefined;
    inputs?: Record<string, string> | undefined;
    branch?: string | undefined;
    jobId?: number | undefined;
    tailLines?: number | undefined;
}>;
export type GithubActionsInput = z.infer<typeof GithubActionsInputSchema>;
//# sourceMappingURL=actions.d.ts.map