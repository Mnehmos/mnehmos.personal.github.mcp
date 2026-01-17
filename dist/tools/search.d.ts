/**
 * GitHub Search tool implementation.
 * Advanced cross-repo search operations.
 */
import { type GithubSearchInput } from '../schemas/search.js';
export interface SearchToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
/**
 * Main search tool handler.
 */
export declare function handleSearchTool(input: GithubSearchInput): Promise<SearchToolResult>;
//# sourceMappingURL=search.d.ts.map