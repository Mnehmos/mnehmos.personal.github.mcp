/**
 * GitHub Label tool implementation.
 * Label CRUD operations.
 */
import { type GithubLabelInput } from '../schemas/label.js';
export interface LabelToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
/**
 * Main label tool handler.
 */
export declare function handleLabelTool(input: GithubLabelInput): Promise<LabelToolResult>;
//# sourceMappingURL=label.d.ts.map