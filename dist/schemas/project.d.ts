import { z } from 'zod';
export declare const GithubProjectInputSchema: z.ZodObject<{
    action: z.ZodEnum<["list", "get", "get_column", "move", "add_item", "remove_item", "list_fields", "set_field", "create_draft"]>;
    repo: z.ZodString;
    project: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    issue: z.ZodOptional<z.ZodNumber>;
    itemId: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    field: z.ZodOptional<z.ZodString>;
    fieldValue: z.ZodOptional<z.ZodString>;
    column: z.ZodOptional<z.ZodString>;
    contentId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "list" | "get" | "get_column" | "move" | "add_item" | "remove_item" | "list_fields" | "set_field" | "create_draft";
    repo: string;
    title?: string | undefined;
    body?: string | undefined;
    issue?: number | undefined;
    comment?: string | undefined;
    project?: string | number | undefined;
    itemId?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
    field?: string | undefined;
    fieldValue?: string | undefined;
    column?: string | undefined;
    contentId?: string | undefined;
}, {
    action: "list" | "get" | "get_column" | "move" | "add_item" | "remove_item" | "list_fields" | "set_field" | "create_draft";
    repo: string;
    title?: string | undefined;
    body?: string | undefined;
    issue?: number | undefined;
    comment?: string | undefined;
    project?: string | number | undefined;
    itemId?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
    field?: string | undefined;
    fieldValue?: string | undefined;
    column?: string | undefined;
    contentId?: string | undefined;
}>;
export type GithubProjectInput = z.infer<typeof GithubProjectInputSchema>;
export interface ProjectColumn {
    name: string;
    items: Array<{
        id: string;
        type: 'Issue' | 'PullRequest' | 'DraftIssue';
        number?: number;
        title: string;
        assignees: string[];
        labels: string[];
    }>;
}
export interface Project {
    number: number;
    title: string;
    url: string;
    shortDescription: string | null;
    columns: ProjectColumn[];
    totalItems: number;
}
//# sourceMappingURL=project.d.ts.map