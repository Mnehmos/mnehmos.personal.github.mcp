import { z } from 'zod';
export declare const REACTION_TYPES: readonly ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"];
export declare const ReactionTypeSchema: z.ZodEnum<["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"]>;
export type ReactionType = z.infer<typeof ReactionTypeSchema>;
export declare const ReactionSchema: z.ZodObject<{
    id: z.ZodNumber;
    content: z.ZodEnum<["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"]>;
    user: z.ZodObject<{
        login: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        login: string;
    }, {
        login: string;
    }>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    user: {
        login: string;
    };
    content: "+1" | "-1" | "laugh" | "confused" | "heart" | "hooray" | "rocket" | "eyes";
    id: number;
}, {
    createdAt: string;
    user: {
        login: string;
    };
    content: "+1" | "-1" | "laugh" | "confused" | "heart" | "hooray" | "rocket" | "eyes";
    id: number;
}>;
export type Reaction = z.infer<typeof ReactionSchema>;
export declare const ReactionGroupSchema: z.ZodObject<{
    content: z.ZodString;
    users: z.ZodObject<{
        totalCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalCount: number;
    }, {
        totalCount: number;
    }>;
}, "strip", z.ZodTypeAny, {
    content: string;
    users: {
        totalCount: number;
    };
}, {
    content: string;
    users: {
        totalCount: number;
    };
}>;
export declare const GithubReactionInputSchema: z.ZodObject<{
    action: z.ZodEnum<["add", "remove", "list", "get_summary"]>;
    repo: z.ZodString;
    contentType: z.ZodEnum<["issue", "pr", "comment", "release"]>;
    number: z.ZodOptional<z.ZodNumber>;
    commentId: z.ZodOptional<z.ZodNumber>;
    releaseId: z.ZodOptional<z.ZodNumber>;
    reaction: z.ZodOptional<z.ZodEnum<["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"]>>;
    reactionId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    action: "list" | "add" | "remove" | "get_summary";
    repo: string;
    contentType: "issue" | "comment" | "pr" | "release";
    number?: number | undefined;
    commentId?: number | undefined;
    releaseId?: number | undefined;
    reaction?: "+1" | "-1" | "laugh" | "confused" | "heart" | "hooray" | "rocket" | "eyes" | undefined;
    reactionId?: number | undefined;
}, {
    action: "list" | "add" | "remove" | "get_summary";
    repo: string;
    contentType: "issue" | "comment" | "pr" | "release";
    number?: number | undefined;
    commentId?: number | undefined;
    releaseId?: number | undefined;
    reaction?: "+1" | "-1" | "laugh" | "confused" | "heart" | "hooray" | "rocket" | "eyes" | undefined;
    reactionId?: number | undefined;
}>;
export type GithubReactionInput = z.infer<typeof GithubReactionInputSchema>;
//# sourceMappingURL=reaction.d.ts.map