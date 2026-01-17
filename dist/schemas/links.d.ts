import { z } from 'zod';
export declare const LinkType: z.ZodEnum<["blocks", "blocked_by", "relates", "duplicates", "parent", "child"]>;
export type LinkType = z.infer<typeof LinkType>;
export declare const GithubLinksInputSchema: z.ZodObject<{
    action: z.ZodEnum<["add", "remove", "get_graph", "find_blockers", "find_cycles"]>;
    repo: z.ZodString;
    source: z.ZodOptional<z.ZodNumber>;
    target: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<["blocks", "blocked_by", "relates", "duplicates", "parent", "child"]>>;
    issue: z.ZodOptional<z.ZodNumber>;
    depth: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    action: "add" | "remove" | "get_graph" | "find_blockers" | "find_cycles";
    repo: string;
    depth: number;
    issue?: number | undefined;
    type?: "blocks" | "blocked_by" | "relates" | "duplicates" | "parent" | "child" | undefined;
    source?: number | undefined;
    target?: number | undefined;
}, {
    action: "add" | "remove" | "get_graph" | "find_blockers" | "find_cycles";
    repo: string;
    issue?: number | undefined;
    type?: "blocks" | "blocked_by" | "relates" | "duplicates" | "parent" | "child" | undefined;
    source?: number | undefined;
    target?: number | undefined;
    depth?: number | undefined;
}>;
export type GithubLinksInput = z.infer<typeof GithubLinksInputSchema>;
export interface IssueNode {
    number: number;
    title: string;
    state: 'open' | 'closed';
    labels: string[];
}
export interface IssueLink {
    source: number;
    target: number;
    type: LinkType;
}
export interface DependencyGraph {
    nodes: IssueNode[];
    edges: IssueLink[];
    cycles: number[][];
}
//# sourceMappingURL=links.d.ts.map