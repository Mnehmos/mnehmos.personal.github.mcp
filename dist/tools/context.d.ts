/**
 * GitHub Context tool implementation.
 * Session context reconstruction for agents.
 */
import { type GithubContextInput } from '../schemas/context.js';
export interface ContextToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
/**
 * Main context tool handler.
 */
export declare function handleContextTool(input: GithubContextInput): Promise<ContextToolResult>;
//# sourceMappingURL=context.d.ts.map