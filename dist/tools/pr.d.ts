/**
 * GitHub PR tool implementation.
 * Pull request management operations.
 */
import { type GithubPrInput } from '../schemas/pr.js';
export interface PrToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
/**
 * Main PR tool handler - dispatches to appropriate action.
 */
export declare function handlePrTool(input: GithubPrInput): Promise<PrToolResult>;
//# sourceMappingURL=pr.d.ts.map