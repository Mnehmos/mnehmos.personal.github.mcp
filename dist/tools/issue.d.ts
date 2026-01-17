/**
 * GitHub Issue tool implementation.
 * Composite operations for issue lifecycle management.
 */
import { type GithubIssueInput } from '../schemas/issue.js';
export interface IssueToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
/**
 * Main issue tool handler - dispatches to appropriate action.
 */
export declare function handleIssueTool(input: GithubIssueInput): Promise<IssueToolResult>;
//# sourceMappingURL=issue.d.ts.map