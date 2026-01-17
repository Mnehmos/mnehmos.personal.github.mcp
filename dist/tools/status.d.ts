/**
 * GitHub Status tool implementation.
 * Cross-repo activity overview.
 */
import { type GithubStatusInput } from '../schemas/status.js';
export interface StatusToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
export declare function handleStatusTool(input: GithubStatusInput): Promise<StatusToolResult>;
//# sourceMappingURL=status.d.ts.map