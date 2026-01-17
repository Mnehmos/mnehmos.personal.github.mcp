import { z } from 'zod';
export declare const LabelSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    id: z.ZodOptional<z.ZodString>;
    default: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    color: string;
    description?: string | null | undefined;
    id?: string | undefined;
    default?: boolean | undefined;
}, {
    name: string;
    color: string;
    description?: string | null | undefined;
    id?: string | undefined;
    default?: boolean | undefined;
}>;
export type Label = z.infer<typeof LabelSchema>;
export declare const GithubLabelInputSchema: z.ZodObject<{
    action: z.ZodEnum<["list", "get", "create", "edit", "delete", "clone"]>;
    repo: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    newName: z.ZodOptional<z.ZodString>;
    sourceRepo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "list" | "create" | "edit" | "get" | "delete" | "clone";
    repo: string;
    name?: string | undefined;
    color?: string | undefined;
    description?: string | undefined;
    newName?: string | undefined;
    sourceRepo?: string | undefined;
}, {
    action: "list" | "create" | "edit" | "get" | "delete" | "clone";
    repo: string;
    name?: string | undefined;
    color?: string | undefined;
    description?: string | undefined;
    newName?: string | undefined;
    sourceRepo?: string | undefined;
}>;
export type GithubLabelInput = z.infer<typeof GithubLabelInputSchema>;
//# sourceMappingURL=label.d.ts.map