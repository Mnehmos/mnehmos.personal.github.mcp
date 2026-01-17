import { z } from 'zod';
export declare const NotificationSchema: z.ZodObject<{
    id: z.ZodString;
    unread: z.ZodBoolean;
    reason: z.ZodString;
    updatedAt: z.ZodString;
    lastReadAt: z.ZodNullable<z.ZodString>;
    subject: z.ZodObject<{
        title: z.ZodString;
        url: z.ZodNullable<z.ZodString>;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        url: string | null;
        type: string;
    }, {
        title: string;
        url: string | null;
        type: string;
    }>;
    repository: z.ZodObject<{
        name: z.ZodString;
        fullName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        fullName: string;
    }, {
        name: string;
        fullName: string;
    }>;
}, "strip", z.ZodTypeAny, {
    updatedAt: string;
    reason: string;
    id: string;
    repository: {
        name: string;
        fullName: string;
    };
    unread: boolean;
    lastReadAt: string | null;
    subject: {
        title: string;
        url: string | null;
        type: string;
    };
}, {
    updatedAt: string;
    reason: string;
    id: string;
    repository: {
        name: string;
        fullName: string;
    };
    unread: boolean;
    lastReadAt: string | null;
    subject: {
        title: string;
        url: string | null;
        type: string;
    };
}>;
export type Notification = z.infer<typeof NotificationSchema>;
export declare const GithubNotificationInputSchema: z.ZodObject<{
    action: z.ZodEnum<["list", "get", "mark_read", "mark_all_read", "mark_done", "subscribe", "unsubscribe"]>;
    threadId: z.ZodOptional<z.ZodString>;
    all: z.ZodOptional<z.ZodBoolean>;
    participating: z.ZodOptional<z.ZodBoolean>;
    since: z.ZodOptional<z.ZodString>;
    before: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
    owner: z.ZodOptional<z.ZodString>;
    repoName: z.ZodOptional<z.ZodString>;
    issueNumber: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    action: "list" | "get" | "mark_read" | "mark_all_read" | "mark_done" | "subscribe" | "unsubscribe";
    limit: number;
    all?: boolean | undefined;
    repo?: string | undefined;
    since?: string | undefined;
    owner?: string | undefined;
    threadId?: string | undefined;
    participating?: boolean | undefined;
    before?: string | undefined;
    repoName?: string | undefined;
    issueNumber?: number | undefined;
}, {
    action: "list" | "get" | "mark_read" | "mark_all_read" | "mark_done" | "subscribe" | "unsubscribe";
    all?: boolean | undefined;
    repo?: string | undefined;
    limit?: number | undefined;
    since?: string | undefined;
    owner?: string | undefined;
    threadId?: string | undefined;
    participating?: boolean | undefined;
    before?: string | undefined;
    repoName?: string | undefined;
    issueNumber?: number | undefined;
}>;
export type GithubNotificationInput = z.infer<typeof GithubNotificationInputSchema>;
//# sourceMappingURL=notification.d.ts.map