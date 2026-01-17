/**
 * Chat-friendly formatters for GitHub issues.
 * Designed for terminal/chat display with box-drawing characters.
 */
import type { IssueJson } from '../cli.js';
/**
 * Format a single issue for chat display.
 */
export declare function formatIssue(issue: IssueJson, options?: {
    includeBody?: boolean;
    includeComments?: boolean;
    maxBodyLines?: number;
    maxComments?: number;
}): string;
/**
 * Format a list of issues as a compact table.
 */
export declare function formatIssueList(issues: IssueJson[], options?: {
    showLabels?: boolean;
    maxTitleLength?: number;
}): string;
/**
 * Format issue search results with relevance context.
 */
export declare function formatSearchResults(issues: IssueJson[], query: string): string;
//# sourceMappingURL=issue.d.ts.map