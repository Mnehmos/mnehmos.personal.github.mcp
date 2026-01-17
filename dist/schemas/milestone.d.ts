import { z } from 'zod';
export declare const MilestoneSchema: z.ZodObject<{
    number: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    state: z.ZodEnum<["open", "closed"]>;
    dueOn: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    closedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
    openIssues: z.ZodOptional<z.ZodNumber>;
    closedIssues: z.ZodOptional<z.ZodNumber>;
    url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    number: number;
    title: string;
    state: "open" | "closed";
    url?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    closedAt?: string | null | undefined;
    description?: string | null | undefined;
    dueOn?: string | null | undefined;
    openIssues?: number | undefined;
    closedIssues?: number | undefined;
}, {
    number: number;
    title: string;
    state: "open" | "closed";
    url?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    closedAt?: string | null | undefined;
    description?: string | null | undefined;
    dueOn?: string | null | undefined;
    openIssues?: number | undefined;
    closedIssues?: number | undefined;
}>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export declare const GithubMilestoneInputSchema: z.ZodObject<{
    action: z.ZodEnum<["list", "get", "create", "edit", "delete"]>;
    repo: z.ZodString;
    milestone: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dueOn: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodEnum<["open", "closed"]>>;
}, "strip", z.ZodTypeAny, {
    action: "list" | "create" | "edit" | "get" | "delete";
    repo: string;
    title?: string | undefined;
    state?: "open" | "closed" | undefined;
    milestone?: string | number | undefined;
    description?: string | undefined;
    dueOn?: string | undefined;
}, {
    action: "list" | "create" | "edit" | "get" | "delete";
    repo: string;
    title?: string | undefined;
    state?: "open" | "closed" | undefined;
    milestone?: string | number | undefined;
    description?: string | undefined;
    dueOn?: string | undefined;
}>;
export type GithubMilestoneInput = z.infer<typeof GithubMilestoneInputSchema>;
//# sourceMappingURL=milestone.d.ts.map