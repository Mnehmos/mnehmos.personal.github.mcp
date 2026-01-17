/**
 * GitHub Project tool implementation.
 * Kanban board and workflow management with GraphQL support.
 */
import { type GithubProjectInput } from '../schemas/project.js';
export interface ProjectToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
/**
 * Main project tool handler.
 */
export declare function handleProjectTool(input: GithubProjectInput): Promise<ProjectToolResult>;
//# sourceMappingURL=project.d.ts.map