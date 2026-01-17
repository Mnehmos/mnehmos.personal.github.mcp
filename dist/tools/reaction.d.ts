/**
 * GitHub Reaction tool implementation.
 */
import { type GithubReactionInput } from '../schemas/reaction.js';
export interface ReactionToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
export declare function handleReactionTool(input: GithubReactionInput): Promise<ReactionToolResult>;
//# sourceMappingURL=reaction.d.ts.map