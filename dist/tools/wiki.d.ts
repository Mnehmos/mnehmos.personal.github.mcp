/**
 * GitHub Wiki tool implementation.
 * Persistent documentation and knowledge base.
 */
import { type GithubWikiInput } from '../schemas/wiki.js';
export interface WikiToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
/**
 * Main wiki tool handler.
 *
 * Note: GitHub Wiki is a separate git repository.
 * Operations require cloning the wiki repo or using API.
 */
export declare function handleWikiTool(input: GithubWikiInput): Promise<WikiToolResult>;
//# sourceMappingURL=wiki.d.ts.map