/**
 * GitHub Milestone tool implementation.
 * Milestone management operations.
 */
import { type GithubMilestoneInput } from '../schemas/milestone.js';
export interface MilestoneToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
/**
 * Main milestone tool handler.
 */
export declare function handleMilestoneTool(input: GithubMilestoneInput): Promise<MilestoneToolResult>;
//# sourceMappingURL=milestone.d.ts.map