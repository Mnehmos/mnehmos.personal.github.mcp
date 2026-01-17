/**
 * GitHub Label tool implementation.
 * Label CRUD operations.
 */

import { gh } from '../cli.js';
import { GithubLabelInputSchema, type GithubLabelInput, type Label } from '../schemas/label.js';

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
export async function handleLabelTool(input: GithubLabelInput): Promise<LabelToolResult> {
  const parsed = GithubLabelInputSchema.safeParse(input);
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
    case 'clone':
      return handleClone(parsed.data);
    default:
      return { success: false, action, error: `Unknown action: ${action}` };
  }
}

async function handleList(input: GithubLabelInput): Promise<LabelToolResult> {
  const result = await gh<Label[]>([
    'label', 'list', '-R', input.repo,
    '--json', 'name,color,description'
  ]);

  if (!result.success) {
    return { success: false, action: 'list', error: result.error };
  }

  const labels = result.data || [];
  const formatted = formatLabelList(labels);

  return {
    success: true,
    action: 'list',
    data: labels,
    formatted,
  };
}

async function handleGet(input: GithubLabelInput): Promise<LabelToolResult> {
  if (!input.name) {
    return { success: false, action: 'get', error: 'Label name is required' };
  }

  // gh label list and filter
  const result = await gh<Label[]>([
    'label', 'list', '-R', input.repo,
    '--json', 'name,color,description'
  ]);

  if (!result.success) {
    return { success: false, action: 'get', error: result.error };
  }

  const label = result.data?.find(l => 
    l.name.toLowerCase() === input.name!.toLowerCase()
  );

  if (!label) {
    return { success: false, action: 'get', error: `Label "${input.name}" not found` };
  }

  return {
    success: true,
    action: 'get',
    data: label,
    formatted: formatLabel(label),
  };
}

async function handleCreate(input: GithubLabelInput): Promise<LabelToolResult> {
  if (!input.name) {
    return { success: false, action: 'create', error: 'Label name is required' };
  }

  const args = ['label', 'create', input.name, '-R', input.repo];

  if (input.color) args.push('--color', input.color);
  if (input.description) args.push('--description', input.description);

  const result = await gh<string>(args);

  if (!result.success) {
    return { success: false, action: 'create', error: result.error };
  }

  return {
    success: true,
    action: 'create',
    formatted: `✅ Created label "${input.name}"${input.color ? ` (color: #${input.color})` : ''}`,
  };
}

async function handleEdit(input: GithubLabelInput): Promise<LabelToolResult> {
  if (!input.name) {
    return { success: false, action: 'edit', error: 'Label name is required' };
  }

  const args = ['label', 'edit', input.name, '-R', input.repo];

  if (input.newName) args.push('--name', input.newName);
  if (input.color) args.push('--color', input.color);
  if (input.description) args.push('--description', input.description);

  const result = await gh<string>(args);

  if (!result.success) {
    return { success: false, action: 'edit', error: result.error };
  }

  return {
    success: true,
    action: 'edit',
    formatted: `✅ Updated label "${input.name}"${input.newName ? ` → "${input.newName}"` : ''}`,
  };
}

async function handleDelete(input: GithubLabelInput): Promise<LabelToolResult> {
  if (!input.name) {
    return { success: false, action: 'delete', error: 'Label name is required' };
  }

  const result = await gh<string>([
    'label', 'delete', input.name, '-R', input.repo, '--yes'
  ]);

  if (!result.success) {
    return { success: false, action: 'delete', error: result.error };
  }

  return {
    success: true,
    action: 'delete',
    formatted: `✅ Deleted label "${input.name}"`,
  };
}

async function handleClone(input: GithubLabelInput): Promise<LabelToolResult> {
  if (!input.sourceRepo) {
    return { success: false, action: 'clone', error: 'Source repo is required' };
  }

  const result = await gh<string>([
    'label', 'clone', input.sourceRepo, '-R', input.repo
  ]);

  if (!result.success) {
    return { success: false, action: 'clone', error: result.error };
  }

  return {
    success: true,
    action: 'clone',
    formatted: `✅ Cloned labels from ${input.sourceRepo} to ${input.repo}`,
  };
}

// Formatters
function formatLabel(label: Label): string {
  const lines = [
    `🏷️  ${label.name}`,
    `   Color: #${label.color}`,
  ];
  if (label.description) {
    lines.push(`   Description: ${label.description}`);
  }
  return lines.join('\n');
}

function formatLabelList(labels: Label[]): string {
  if (labels.length === 0) {
    return 'No labels found.';
  }

  const lines = [
    '🏷️  Labels',
    '─'.repeat(50),
  ];

  labels.forEach(label => {
    const desc = label.description ? ` - ${truncate(label.description, 30)}` : '';
    lines.push(`  #${label.color} ${label.name}${desc}`);
  });

  lines.push('─'.repeat(50));
  lines.push(`Total: ${labels.length} labels`);

  return lines.join('\n');
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 3) + '...';
}
