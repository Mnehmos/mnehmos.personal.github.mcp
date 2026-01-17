/**
 * GitHub Notification tool implementation.
 * Notification management operations.
 */
import { type GithubNotificationInput } from '../schemas/notification.js';
export interface NotificationToolResult {
    success: boolean;
    action: string;
    data?: any;
    formatted?: string;
    error?: string;
}
/**
 * Main notification tool handler.
 */
export declare function handleNotificationTool(input: GithubNotificationInput): Promise<NotificationToolResult>;
//# sourceMappingURL=notification.d.ts.map