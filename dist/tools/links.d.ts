/**
 * GitHub Issue Links tool implementation.
 * Dependency tracking and relationship management.
 */
import { type GithubLinksInput } from '../schemas/links.js';
export interface LinksToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
/**
 * Main links tool handler.
 */
export declare function handleLinksTool(input: GithubLinksInput): Promise<LinksToolResult>;
//# sourceMappingURL=links.d.ts.map