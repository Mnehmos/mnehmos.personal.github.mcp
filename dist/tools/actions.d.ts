/**
 * GitHub Actions tool implementation.
 * Workflow management and CI/CD operations.
 */
import { type GithubActionsInput } from '../schemas/actions.js';
export interface ActionsToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
export declare function handleActionsTool(input: GithubActionsInput): Promise<ActionsToolResult>;
//# sourceMappingURL=actions.d.ts.map