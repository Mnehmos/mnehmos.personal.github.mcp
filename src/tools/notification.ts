/**
 * GitHub Notification tool implementation.
 * Notification management operations.
 */

import { ghApi } from '../cli.js';
import { GithubNotificationInputSchema, type GithubNotificationInput, type Notification } from '../schemas/notification.js';

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
export async function handleNotificationTool(input: GithubNotificationInput): Promise<NotificationToolResult> {
  const parsed = GithubNotificationInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      action: input.action,
      error: `Validation error: ${parsed.error.message}`,
    };
  }

  const { action } = parsed.data;

  switch (action) {
    case 'list':
      return handleList(parsed.data);
    case 'get':
      return handleGet(parsed.data);
    case 'mark_read':
      return handleMarkRead(parsed.data);
    case 'mark_all_read':
      return handleMarkAllRead(parsed.data);
    case 'mark_done':
      return handleMarkDone(parsed.data);
    case 'subscribe':
      return handleSubscribe(parsed.data);
    case 'unsubscribe':
      return handleUnsubscribe(parsed.data);
    default:
      return { success: false, action, error: `Unknown action: ${action}` };
  }
}

async function handleList(input: GithubNotificationInput): Promise<NotificationToolResult> {
  const params = new URLSearchParams();
  
  if (input.all) params.append('all', 'true');
  if (input.participating) params.append('participating', 'true');
  if (input.since) params.append('since', input.since);
  if (input.before) params.append('before', input.before);
  params.append('per_page', String(input.limit || 50));

  let endpoint = '/notifications';
  if (input.repo) {
    const [owner, name] = input.repo.split('/');
    endpoint = `/repos/${owner}/${name}/notifications`;
  }

  const result = await ghApi.rest<Notification[]>(`${endpoint}?${params.toString()}`);

  if (!result.success) {
    return { success: false, action: 'list', error: result.error };
  }

  return {
    success: true,
    action: 'list',
    data: result.data,
    formatted: formatNotificationList(result.data || []),
  };
}

async function handleGet(input: GithubNotificationInput): Promise<NotificationToolResult> {
  if (!input.threadId) {
    return { success: false, action: 'get', error: 'Thread ID is required' };
  }

  const result = await ghApi.rest<Notification>(`/notifications/threads/${input.threadId}`);

  if (!result.success) {
    return { success: false, action: 'get', error: result.error };
  }

  return {
    success: true,
    action: 'get',
    data: result.data,
    formatted: result.data ? formatNotification(result.data) : undefined,
  };
}

async function handleMarkRead(input: GithubNotificationInput): Promise<NotificationToolResult> {
  if (!input.threadId) {
    return { success: false, action: 'mark_read', error: 'Thread ID is required' };
  }

  const result = await ghApi.rest<void>(
    `/notifications/threads/${input.threadId}`,
    'PATCH'
  );

  if (!result.success) {
    return { success: false, action: 'mark_read', error: result.error };
  }

  return {
    success: true,
    action: 'mark_read',
    formatted: `✅ Marked notification ${input.threadId} as read`,
  };
}

async function handleMarkAllRead(input: GithubNotificationInput): Promise<NotificationToolResult> {
  let endpoint = '/notifications';
  if (input.repo) {
    const [owner, name] = input.repo.split('/');
    endpoint = `/repos/${owner}/${name}/notifications`;
  }

  const result = await ghApi.rest<void>(endpoint, 'PUT', {
    last_read_at: new Date().toISOString(),
  });

  if (!result.success) {
    return { success: false, action: 'mark_all_read', error: result.error };
  }

  return {
    success: true,
    action: 'mark_all_read',
    formatted: `✅ Marked all notifications as read${input.repo ? ` for ${input.repo}` : ''}`,
  };
}

async function handleMarkDone(input: GithubNotificationInput): Promise<NotificationToolResult> {
  if (!input.threadId) {
    return { success: false, action: 'mark_done', error: 'Thread ID is required' };
  }

  const result = await ghApi.rest<void>(
    `/notifications/threads/${input.threadId}`,
    'DELETE'
  );

  if (!result.success) {
    return { success: false, action: 'mark_done', error: result.error };
  }

  return {
    success: true,
    action: 'mark_done',
    formatted: `✅ Marked notification ${input.threadId} as done`,
  };
}

async function handleSubscribe(input: GithubNotificationInput): Promise<NotificationToolResult> {
  if (!input.threadId) {
    return { success: false, action: 'subscribe', error: 'Thread ID is required' };
  }

  const result = await ghApi.rest<void>(
    `/notifications/threads/${input.threadId}/subscription`,
    'PUT',
    { subscribed: true }
  );

  if (!result.success) {
    return { success: false, action: 'subscribe', error: result.error };
  }

  return {
    success: true,
    action: 'subscribe',
    formatted: `✅ Subscribed to notification thread ${input.threadId}`,
  };
}

async function handleUnsubscribe(input: GithubNotificationInput): Promise<NotificationToolResult> {
  if (!input.threadId) {
    return { success: false, action: 'unsubscribe', error: 'Thread ID is required' };
  }

  const result = await ghApi.rest<void>(
    `/notifications/threads/${input.threadId}/subscription`,
    'DELETE'
  );

  if (!result.success) {
    return { success: false, action: 'unsubscribe', error: result.error };
  }

  return {
    success: true,
    action: 'unsubscribe',
    formatted: `✅ Unsubscribed from notification thread ${input.threadId}`,
  };
}

// Formatters
function formatNotification(n: Notification): string {
  const unread = n.unread ? '🔵' : '⚪';
  const lines = [
    `${unread} ${n.subject.type}: ${n.subject.title}`,
    `   Repo: ${n.repository.fullName}`,
    `   Reason: ${n.reason}`,
    `   Updated: ${new Date(n.updatedAt).toLocaleString()}`,
  ];
  return lines.join('\n');
}

function formatNotificationList(notifications: Notification[]): string {
  if (notifications.length === 0) {
    return '📬 No notifications';
  }

  const lines = [
    `🔔 Notifications (${notifications.length})`,
    '─'.repeat(60),
  ];

  // Group by repo
  const byRepo = new Map<string, Notification[]>();
  notifications.forEach(n => {
    const repo = n.repository.fullName;
    if (!byRepo.has(repo)) byRepo.set(repo, []);
    byRepo.get(repo)!.push(n);
  });

  byRepo.forEach((items, repo) => {
    lines.push(`\n📁 ${repo}`);
    items.forEach(n => {
      const unread = n.unread ? '🔵' : '⚪';
      const type = n.subject.type === 'PullRequest' ? 'PR' : n.subject.type;
      lines.push(`  ${unread} [${type}] ${truncate(n.subject.title, 45)}`);
    });
  });

  return lines.join('\n');
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 3) + '...';
}
