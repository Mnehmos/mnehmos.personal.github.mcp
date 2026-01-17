/**
 * GitHub Status tool implementation.
 * Cross-repo activity overview.
 */

import { gh } from '../cli.js';
import { GithubStatusInputSchema, type GithubStatusInput } from '../schemas/status.js';

export interface StatusToolResult {
  success: boolean;
  action: string;
  data?: any;
  formatted?: string;
  error?: string;
}

export async function handleStatusTool(input: GithubStatusInput): Promise<StatusToolResult> {
  const parsed = GithubStatusInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, action: input.action, error: `Validation error: ${parsed.error.message}` };
  }

  const { action } = parsed.data;

  switch (action) {
    case 'get': return handleGet(parsed.data);
    case 'assigned': return handleAssigned(parsed.data);
    case 'review_requests': return handleReviewRequests(parsed.data);
    case 'mentions': return handleMentions(parsed.data);
    case 'activity': return handleActivity(parsed.data);
    default: return { success: false, action, error: `Unknown action: ${action}` };
  }
}

async function handleGet(input: GithubStatusInput): Promise<StatusToolResult> {
  // Use gh status for cross-repo overview
  const args = ['status'];
  if (input.org) args.push('-o', input.org);
  if (input.exclude?.length) input.exclude.forEach(e => args.push('-e', e));

  const result = await gh<string>(args);
  
  if (!result.success) {
    return { success: false, action: 'get', error: result.error };
  }

  return {
    success: true,
    action: 'get',
    data: result.data,
    formatted: `📊 GitHub Status Overview\n${'─'.repeat(60)}\n${result.data}`,
  };
}

async function handleAssigned(input: GithubStatusInput): Promise<StatusToolResult> {
  const issueArgs = ['search', 'issues', 'assignee:@me', 'state:open', '--limit', String(input.limit || 10), '--json', 'number,title,repository,url,updatedAt'];
  const prArgs = ['search', 'prs', 'assignee:@me', 'state:open', '--limit', String(input.limit || 10), '--json', 'number,title,repository,url,state,updatedAt'];

  const [issues, prs] = await Promise.all([gh<any[]>(issueArgs), gh<any[]>(prArgs)]);

  const data = { issues: issues.data || [], prs: prs.data || [] };
  const lines = ['📋 Assigned to You', '─'.repeat(50)];
  
  if (data.issues.length) {
    lines.push('\n🔵 Issues:');
    data.issues.forEach(i => lines.push(`  #${i.number} ${i.repository?.nameWithOwner || ''} - ${i.title.slice(0, 40)}`));
  }
  if (data.prs.length) {
    lines.push('\n🟣 Pull Requests:');
    data.prs.forEach(p => lines.push(`  #${p.number} ${p.repository?.nameWithOwner || ''} - ${p.title.slice(0, 40)}`));
  }

  return { success: true, action: 'assigned', data, formatted: lines.join('\n') };
}

async function handleReviewRequests(input: GithubStatusInput): Promise<StatusToolResult> {
  const args = ['search', 'prs', 'review-requested:@me', 'state:open', '--limit', String(input.limit || 10), '--json', 'number,title,repository,url,author'];
  const result = await gh<any[]>(args);

  if (!result.success) return { success: false, action: 'review_requests', error: result.error };

  const prs = result.data || [];
  const lines = ['👀 Review Requests', '─'.repeat(50)];
  if (prs.length === 0) lines.push('No pending review requests');
  else prs.forEach(p => lines.push(`  #${p.number} ${p.repository?.nameWithOwner || ''} by @${p.author?.login || '?'}`));

  return { success: true, action: 'review_requests', data: prs, formatted: lines.join('\n') };
}

async function handleMentions(input: GithubStatusInput): Promise<StatusToolResult> {
  const args = ['search', 'issues', 'mentions:@me', '--limit', String(input.limit || 10), '--json', 'number,title,repository,url,isPullRequest'];
  const result = await gh<any[]>(args);

  if (!result.success) return { success: false, action: 'mentions', error: result.error };

  const items = result.data || [];
  const lines = ['💬 Mentions', '─'.repeat(50)];
  if (items.length === 0) lines.push('No recent mentions');
  else items.forEach(i => {
    const type = i.isPullRequest ? 'PR' : 'Issue';
    lines.push(`  [${type}] #${i.number} ${i.repository?.nameWithOwner || ''}`);
  });

  return { success: true, action: 'mentions', data: items, formatted: lines.join('\n') };
}

async function handleActivity(input: GithubStatusInput): Promise<StatusToolResult> {
  // Get recent activity via notifications
  const args = ['api', '/notifications', '--jq', '.[].subject.title'];
  const result = await gh<string>(args);

  return {
    success: true,
    action: 'activity',
    data: result.data,
    formatted: `📊 Recent Activity\n${'─'.repeat(50)}\n${result.data || 'No recent activity'}`,
  };
}
