/**
 * GitHub PR tool implementation.
 * Pull request management operations.
 */

import { ghPr, gh } from '../cli.js';
import { GithubPrInputSchema, type GithubPrInput } from '../schemas/pr.js';
import { formatPr, formatPrList, formatPrChecks } from '../formatters/pr.js';

export interface PrToolResult {
  success: boolean;
  action: string;
  data?: any;
  formatted?: string;
  error?: string;
}

const PR_JSON_FIELDS = [
  'number', 'title', 'body', 'state', 'url',
  'createdAt', 'updatedAt', 'closedAt', 'mergedAt',
  'author', 'assignees', 'labels', 'milestone',
  'headRefName', 'baseRefName', 'isDraft', 'mergeable',
  'reviewDecision', 'additions', 'deletions', 'changedFiles',
  'reviews', 'statusCheckRollup'
].join(',');

/**
 * Main PR tool handler - dispatches to appropriate action.
 */
export async function handlePrTool(input: GithubPrInput): Promise<PrToolResult> {
  const parsed = GithubPrInputSchema.safeParse(input);
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
    case 'create':
      return handleCreate(parsed.data);
    case 'merge':
      return handleMerge(parsed.data);
    case 'close':
      return handleClose(parsed.data);
    case 'reopen':
      return handleReopen(parsed.data);
    case 'ready':
      return handleReady(parsed.data);
    case 'review':
      return handleReview(parsed.data);
    case 'checks':
      return handleChecks(parsed.data);
    case 'comment':
      return handleComment(parsed.data);
    case 'diff':
      return handleDiff(parsed.data);
    default:
      return { success: false, action, error: `Unknown action: ${action}` };
  }
}

async function handleList(input: GithubPrInput): Promise<PrToolResult> {
  const result = await gh<any[]>([
    'pr', 'list', '-R', input.repo,
    '--state', input.state || 'open',
    '--limit', String(input.limit || 30),
    '--json', PR_JSON_FIELDS
  ]);

  if (!result.success) {
    return { success: false, action: 'list', error: result.error };
  }

  return {
    success: true,
    action: 'list',
    data: result.data,
    formatted: formatPrList(result.data || []),
  };
}

async function handleGet(input: GithubPrInput): Promise<PrToolResult> {
  if (!input.pr) {
    return { success: false, action: 'get', error: 'PR number is required' };
  }

  const result = await gh<any>([
    'pr', 'view', '-R', input.repo, String(input.pr),
    '--json', PR_JSON_FIELDS
  ]);

  if (!result.success) {
    return { success: false, action: 'get', error: result.error };
  }

  return {
    success: true,
    action: 'get',
    data: result.data,
    formatted: result.data ? formatPr(result.data) : undefined,
  };
}

async function handleCreate(input: GithubPrInput): Promise<PrToolResult> {
  if (!input.title || !input.head) {
    return { success: false, action: 'create', error: 'Title and head branch are required' };
  }

  const args = [
    'pr', 'create', '-R', input.repo,
    '--title', input.title,
    '--head', input.head,
    '--base', input.base || 'main'
  ];

  if (input.body) args.push('--body', input.body);
  if (input.draft) args.push('--draft');
  if (input.labels?.length) {
    input.labels.forEach(l => args.push('--label', l));
  }
  if (input.assignees?.length) {
    input.assignees.forEach(a => args.push('--assignee', a));
  }
  if (input.reviewers?.length) {
    input.reviewers.forEach(r => args.push('--reviewer', r));
  }

  args.push('--json', 'number,url');

  const result = await gh<{ number: number; url: string }>(args);

  if (!result.success) {
    return { success: false, action: 'create', error: result.error };
  }

  return {
    success: true,
    action: 'create',
    data: result.data,
    formatted: `✅ Created PR #${result.data?.number}\n   ${result.data?.url}`,
  };
}

async function handleMerge(input: GithubPrInput): Promise<PrToolResult> {
  if (!input.pr) {
    return { success: false, action: 'merge', error: 'PR number is required' };
  }

  const args = ['pr', 'merge', '-R', input.repo, String(input.pr)];

  switch (input.method) {
    case 'squash':
      args.push('--squash');
      break;
    case 'rebase':
      args.push('--rebase');
      break;
    default:
      args.push('--merge');
  }

  if (input.deleteAfterMerge) args.push('--delete-branch');

  const result = await gh<string>(args);

  if (!result.success) {
    return { success: false, action: 'merge', error: result.error };
  }

  return {
    success: true,
    action: 'merge',
    formatted: `✅ Merged PR #${input.pr} (${input.method || 'merge'})`,
  };
}

async function handleClose(input: GithubPrInput): Promise<PrToolResult> {
  if (!input.pr) {
    return { success: false, action: 'close', error: 'PR number is required' };
  }

  const result = await gh<string>(['pr', 'close', '-R', input.repo, String(input.pr)]);

  if (!result.success) {
    return { success: false, action: 'close', error: result.error };
  }

  return {
    success: true,
    action: 'close',
    formatted: `✅ Closed PR #${input.pr}`,
  };
}

async function handleReopen(input: GithubPrInput): Promise<PrToolResult> {
  if (!input.pr) {
    return { success: false, action: 'reopen', error: 'PR number is required' };
  }

  const result = await gh<string>(['pr', 'reopen', '-R', input.repo, String(input.pr)]);

  if (!result.success) {
    return { success: false, action: 'reopen', error: result.error };
  }

  return {
    success: true,
    action: 'reopen',
    formatted: `✅ Reopened PR #${input.pr}`,
  };
}

async function handleReady(input: GithubPrInput): Promise<PrToolResult> {
  if (!input.pr) {
    return { success: false, action: 'ready', error: 'PR number is required' };
  }

  const result = await gh<string>(['pr', 'ready', '-R', input.repo, String(input.pr)]);

  if (!result.success) {
    return { success: false, action: 'ready', error: result.error };
  }

  return {
    success: true,
    action: 'ready',
    formatted: `✅ Marked PR #${input.pr} as ready for review`,
  };
}

async function handleReview(input: GithubPrInput): Promise<PrToolResult> {
  if (!input.pr) {
    return { success: false, action: 'review', error: 'PR number is required' };
  }
  if (!input.event) {
    return { success: false, action: 'review', error: 'Review event is required (approve, comment, request_changes)' };
  }

  const args = ['pr', 'review', '-R', input.repo, String(input.pr)];

  switch (input.event) {
    case 'approve':
      args.push('--approve');
      break;
    case 'comment':
      args.push('--comment');
      break;
    case 'request_changes':
      args.push('--request-changes');
      break;
  }

  if (input.reviewBody) args.push('--body', input.reviewBody);

  const result = await gh<string>(args);

  if (!result.success) {
    return { success: false, action: 'review', error: result.error };
  }

  return {
    success: true,
    action: 'review',
    formatted: `✅ Added ${input.event} review to PR #${input.pr}`,
  };
}

async function handleChecks(input: GithubPrInput): Promise<PrToolResult> {
  if (!input.pr) {
    return { success: false, action: 'checks', error: 'PR number is required' };
  }

  const result = await gh<any[]>([
    'pr', 'checks', '-R', input.repo, String(input.pr),
    '--json', 'name,state,description,targetUrl'
  ]);

  if (!result.success) {
    return { success: false, action: 'checks', error: result.error };
  }

  return {
    success: true,
    action: 'checks',
    data: result.data,
    formatted: formatPrChecks(result.data || [], input.pr),
  };
}

async function handleComment(input: GithubPrInput): Promise<PrToolResult> {
  if (!input.pr) {
    return { success: false, action: 'comment', error: 'PR number is required' };
  }
  if (!input.comment) {
    return { success: false, action: 'comment', error: 'Comment body is required' };
  }

  const result = await gh<string>([
    'pr', 'comment', '-R', input.repo, String(input.pr),
    '--body', input.comment
  ]);

  if (!result.success) {
    return { success: false, action: 'comment', error: result.error };
  }

  return {
    success: true,
    action: 'comment',
    formatted: `💬 Added comment to PR #${input.pr}`,
  };
}

async function handleDiff(input: GithubPrInput): Promise<PrToolResult> {
  if (!input.pr) {
    return { success: false, action: 'diff', error: 'PR number is required' };
  }

  const result = await gh<string>(['pr', 'diff', '-R', input.repo, String(input.pr)]);

  if (!result.success) {
    return { success: false, action: 'diff', error: result.error };
  }

  // Truncate diff if too long
  let diff = result.data || '';
  if (diff.length > 10000) {
    diff = diff.slice(0, 10000) + '\n... (truncated)';
  }

  return {
    success: true,
    action: 'diff',
    data: diff,
    formatted: `📝 Diff for PR #${input.pr}:\n\`\`\`diff\n${diff}\n\`\`\``,
  };
}
