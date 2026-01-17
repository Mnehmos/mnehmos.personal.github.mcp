import { z } from 'zod';
export declare const GithubWikiInputSchema: z.ZodObject<{
    action: z.ZodEnum<["get", "update", "create", "list", "search"]>;
    repo: z.ZodString;
    page: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "list" | "create" | "search" | "get" | "update";
    repo: string;
    message?: string | undefined;
    query?: string | undefined;
    page?: string | undefined;
    content?: string | undefined;
}, {
    action: "list" | "create" | "search" | "get" | "update";
    repo: string;
    message?: string | undefined;
    query?: string | undefined;
    page?: string | undefined;
    content?: string | undefined;
}>;
export type GithubWikiInput = z.infer<typeof GithubWikiInputSchema>;
export interface WikiPage {
    name: string;
    slug: string;
    content: string;
    lastModified: string;
    author: string;
}
//# sourceMappingURL=wiki.d.ts.map