/**
 * GitHub Milestone tool implementation.
 * Milestone management operations.
 */

import { ghApi } from '../cli.js';
import { GithubMilestoneInputSchema, type GithubMilestoneInput, type Milestone } from '../schemas/milestone.js';

export interface MilestoneToolResult {
  success: boolean;
  action: string;
  data?: any;
  formatted?: string;
  error?: string;
}

/**
 * Main milestone tool handler.
 */
export async function handleMilestoneTool(input: GithubMilestoneInput): Promise<MilestoneToolResult> {
  const parsed = GithubMilestoneInputSchema.safeParse(input);
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
    case 'edit':
      return handleEdit(parsed.data);
    case 'delete':
      return handleDelete(parsed.data);
    default:
      return { success: false, action, error: `Unknown action: ${action}` };
  }
}

function parseRepo(repo: string): { owner: string; name: string } {
  const [owner, name] = repo.split('/');
  return { owner, name };
}

async function handleList(input: GithubMilestoneInput): Promise<MilestoneToolResult> {
  const { owner, name } = parseRepo(input.repo);

  const result = await ghApi.rest<Milestone[]>(
    `/repos/${owner}/${name}/milestones?state=${input.state || 'open'}`
  );

  if (!result.success) {
    return { success: false, action: 'list', error: result.error };
  }

  const milestones = result.data || [];
  return {
    success: true,
    action: 'list',
    data: milestones,
    formatted: formatMilestoneList(milestones),
  };
}

async function handleGet(input: GithubMilestoneInput): Promise<MilestoneToolResult> {
  if (!input.milestone) {
    return { success: false, action: 'get', error: 'Milestone number or title is required' };
  }

  const { owner, name } = parseRepo(input.repo);

  // If it's a number, fetch directly
  if (typeof input.milestone === 'number') {
    const result = await ghApi.rest<Milestone>(
      `/repos/${owner}/${name}/milestones/${input.milestone}`
    );

    if (!result.success) {
      return { success: false, action: 'get', error: result.error };
    }

    return {
      success: true,
      action: 'get',
      data: result.data,
      formatted: result.data ? formatMilestone(result.data) : undefined,
    };
  }

  // If it's a title, list and find
  const listResult = await ghApi.rest<Milestone[]>(
    `/repos/${owner}/${name}/milestones?state=all`
  );

  if (!listResult.success) {
    return { success: false, action: 'get', error: listResult.error };
  }

  const milestone = listResult.data?.find(
    m => m.title.toLowerCase() === String(input.milestone).toLowerCase()
  );

  if (!milestone) {
    return { success: false, action: 'get', error: `Milestone "${input.milestone}" not found` };
  }

  return {
    success: true,
    action: 'get',
    data: milestone,
    formatted: formatMilestone(milestone),
  };
}

async function handleCreate(input: GithubMilestoneInput): Promise<MilestoneToolResult> {
  if (!input.title) {
    return { success: false, action: 'create', error: 'Title is required' };
  }

  const { owner, name } = parseRepo(input.repo);

  const body: Record<string, any> = { title: input.title };
  if (input.description) body.description = input.description;
  if (input.dueOn) body.due_on = input.dueOn;
  if (input.state) body.state = input.state;

  const result = await ghApi.rest<Milestone>(
    `/repos/${owner}/${name}/milestones`,
    'POST',
    body
  );

  if (!result.success) {
    return { success: false, action: 'create', error: result.error };
  }

  return {
    success: true,
    action: 'create',
    data: result.data,
    formatted: `✅ Created milestone "${input.title}" (#${result.data?.number})`,
  };
}

async function handleEdit(input: GithubMilestoneInput): Promise<MilestoneToolResult> {
  if (!input.milestone) {
    return { success: false, action: 'edit', error: 'Milestone number is required' };
  }

  const { owner, name } = parseRepo(input.repo);

  // Get milestone number if title was provided
  let milestoneNumber: number;
  if (typeof input.milestone === 'number') {
    milestoneNumber = input.milestone;
  } else {
    const listResult = await ghApi.rest<Milestone[]>(
      `/repos/${owner}/${name}/milestones?state=all`
    );
    const found = listResult.data?.find(
      m => m.title.toLowerCase() === String(input.milestone).toLowerCase()
    );
    if (!found) {
      return { success: false, action: 'edit', error: `Milestone "${input.milestone}" not found` };
    }
    milestoneNumber = found.number;
  }

  const body: Record<string, any> = {};
  if (input.title) body.title = input.title;
  if (input.description !== undefined) body.description = input.description;
  if (input.dueOn) body.due_on = input.dueOn;
  if (input.state) body.state = input.state;

  const result = await ghApi.rest<Milestone>(
    `/repos/${owner}/${name}/milestones/${milestoneNumber}`,
    'PATCH',
    body
  );

  if (!result.success) {
    return { success: false, action: 'edit', error: result.error };
  }

  return {
    success: true,
    action: 'edit',
    formatted: `✅ Updated milestone #${milestoneNumber}`,
  };
}

async function handleDelete(input: GithubMilestoneInput): Promise<MilestoneToolResult> {
  if (!input.milestone) {
    return { success: false, action: 'delete', error: 'Milestone number is required' };
  }

  const { owner, name } = parseRepo(input.repo);

  // Get milestone number if title was provided
  let milestoneNumber: number;
  if (typeof input.milestone === 'number') {
    milestoneNumber = input.milestone;
  } else {
    const listResult = await ghApi.rest<Milestone[]>(
      `/repos/${owner}/${name}/milestones?state=all`
    );
    const found = listResult.data?.find(
      m => m.title.toLowerCase() === String(input.milestone).toLowerCase()
    );
    if (!found) {
      return { success: false, action: 'delete', error: `Milestone "${input.milestone}" not found` };
    }
    milestoneNumber = found.number;
  }

  const result = await ghApi.rest<void>(
    `/repos/${owner}/${name}/milestones/${milestoneNumber}`,
    'DELETE'
  );

  if (!result.success) {
    return { success: false, action: 'delete', error: result.error };
  }

  return {
    success: true,
    action: 'delete',
    formatted: `✅ Deleted milestone #${milestoneNumber}`,
  };
}

// Formatters
function formatMilestone(m: Milestone): string {
  const progress = m.openIssues !== undefined && m.closedIssues !== undefined
    ? `${m.closedIssues}/${m.openIssues + m.closedIssues} done`
    : '';
  
  const lines = [
    `🎯 ${m.title} (#${m.number})`,
    `   State: ${m.state === 'open' ? '🟢 Open' : '🔴 Closed'}`,
  ];

  if (progress) lines.push(`   Progress: ${progress}`);
  if (m.dueOn) lines.push(`   Due: ${new Date(m.dueOn).toLocaleDateString()}`);
  if (m.description) lines.push(`   ${m.description}`);

  return lines.join('\n');
}

function formatMilestoneList(milestones: Milestone[]): string {
  if (milestones.length === 0) {
    return 'No milestones found.';
  }

  const lines = [
    '🎯 Milestones',
    '─'.repeat(60),
  ];

  milestones.forEach(m => {
    const state = m.state === 'open' ? '🟢' : '🔴';
    const due = m.dueOn ? ` (due: ${new Date(m.dueOn).toLocaleDateString()})` : '';
    lines.push(`  ${state} #${m.number} ${m.title}${due}`);
  });

  lines.push('─'.repeat(60));
  lines.push(`Total: ${milestones.length} milestones`);

  return lines.join('\n');
}
