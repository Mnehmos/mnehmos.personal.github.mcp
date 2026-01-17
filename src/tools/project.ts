/**
 * GitHub Project tool implementation.
 * Kanban board and workflow management with GraphQL support.
 */

import { ghProject, ghApi, gh } from '../cli.js';
import { GithubProjectInputSchema, type GithubProjectInput, type Project, type ProjectColumn } from '../schemas/project.js';
import { formatProjectBoard, formatProjectColumn, formatProjectList } from '../formatters/project.js';

export interface ProjectToolResult {
  success: boolean;
  action: string;
  data?: any;
  formatted?: string;
  error?: string;
}

// GraphQL queries and mutations
const QUERIES = {
  getProjectId: `
    query($owner: String!, $number: Int!) {
      organization(login: $owner) {
        projectV2(number: $number) {
          id
          title
        }
      }
      user(login: $owner) {
        projectV2(number: $number) {
          id
          title
        }
      }
    }
  `,
  
  getProjectFields: `
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          fields(first: 50) {
            nodes {
              ... on ProjectV2Field { id name dataType }
              ... on ProjectV2SingleSelectField { 
                id name dataType
                options { id name }
              }
              ... on ProjectV2IterationField {
                id name dataType
                configuration {
                  iterations { id title startDate duration }
                }
              }
            }
          }
        }
      }
    }
  `,
  
  getItemId: `
    query($projectId: ID!, $issueNumber: Int!, $owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $issueNumber) {
          id
          projectItems(first: 10) {
            nodes {
              id
              project { id }
            }
          }
        }
      }
    }
  `,
};

const MUTATIONS = {
  updateFieldValue: `
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: $value
      }) {
        projectV2Item { id }
      }
    }
  `,
  
  deleteItem: `
    mutation($projectId: ID!, $itemId: ID!) {
      deleteProjectV2Item(input: {
        projectId: $projectId
        itemId: $itemId
      }) {
        deletedItemId
      }
    }
  `,
  
  addDraftIssue: `
    mutation($projectId: ID!, $title: String!, $body: String) {
      addProjectV2DraftIssue(input: {
        projectId: $projectId
        title: $title
        body: $body
      }) {
        projectItem { id }
      }
    }
  `,
};

/**
 * Main project tool handler.
 */
export async function handleProjectTool(input: GithubProjectInput): Promise<ProjectToolResult> {
  const parsed = GithubProjectInputSchema.safeParse(input);
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
      return handleListProjects(parsed.data);
    case 'get':
      return handleGetProject(parsed.data);
    case 'get_column':
      return handleGetColumn(parsed.data);
    case 'move':
      return handleMoveItem(parsed.data);
    case 'add_item':
      return handleAddItem(parsed.data);
    case 'remove_item':
      return handleRemoveItem(parsed.data);
    case 'list_fields':
      return handleListFields(parsed.data);
    case 'set_field':
      return handleSetField(parsed.data);
    case 'create_draft':
      return handleCreateDraft(parsed.data);
    default:
      return { success: false, action, error: `Unknown action: ${action}` };
  }
}

async function handleListProjects(input: GithubProjectInput): Promise<ProjectToolResult> {
  const [owner] = input.repo.split('/');
  const result = await ghProject.list(owner);

  if (!result.success) {
    return { success: false, action: 'list', error: result.error };
  }

  return {
    success: true,
    action: 'list',
    data: result.data,
    formatted: formatProjectList(result.data || []),
  };
}

async function handleGetProject(input: GithubProjectInput): Promise<ProjectToolResult> {
  if (!input.project) {
    return { success: false, action: 'get', error: 'Project name or number is required' };
  }

  const [owner] = input.repo.split('/');
  const projectNum = typeof input.project === 'number'
    ? input.project
    : parseInt(input.project, 10);

  if (isNaN(projectNum)) {
    const listResult = await ghProject.list(owner);
    if (!listResult.success || !listResult.data) {
      return { success: false, action: 'get', error: 'Failed to list projects' };
    }

    const found = listResult.data.find(
      p => p.title.toLowerCase() === String(input.project).toLowerCase()
    );
    if (!found) {
      return { success: false, action: 'get', error: `Project "${input.project}" not found` };
    }

    return handleGetProjectByNumber(owner, found.number, found.title);
  }

  return handleGetProjectByNumber(owner, projectNum, `Project #${projectNum}`);
}

async function handleGetProjectByNumber(
  owner: string,
  projectNumber: number,
  title: string
): Promise<ProjectToolResult> {
  const result = await ghProject.items(owner, projectNumber);

  if (!result.success) {
    return { success: false, action: 'get', error: result.error };
  }

  const items = result.data?.items || [];
  const columnMap = new Map<string, ProjectColumn>();

  for (const item of items) {
    const status = item.status || 'No Status';
    if (!columnMap.has(status)) {
      columnMap.set(status, { name: status, items: [] });
    }

    columnMap.get(status)!.items.push({
      id: item.id,
      type: item.content?.type || 'DraftIssue',
      number: item.content?.number,
      title: item.title || item.content?.title || 'Untitled',
      assignees: item.content?.assignees?.map((a: any) => a.login) || [],
      labels: item.content?.labels?.map((l: any) => l.name) || [],
    });
  }

  const project: Project = {
    number: projectNumber,
    title,
    url: `https://github.com/orgs/${owner}/projects/${projectNumber}`,
    shortDescription: null,
    columns: Array.from(columnMap.values()),
    totalItems: items.length,
  };

  return {
    success: true,
    action: 'get',
    data: project,
    formatted: formatProjectBoard(project),
  };
}

async function handleGetColumn(input: GithubProjectInput): Promise<ProjectToolResult> {
  if (!input.project || !input.column) {
    return { success: false, action: 'get_column', error: 'Project and column are required' };
  }

  const projectResult = await handleGetProject(input);
  if (!projectResult.success || !projectResult.data) {
    return projectResult;
  }

  const project = projectResult.data as Project;
  const column = project.columns.find(
    c => c.name.toLowerCase() === input.column!.toLowerCase()
  );

  if (!column) {
    return {
      success: false,
      action: 'get_column',
      error: `Column "${input.column}" not found. Available: ${project.columns.map(c => c.name).join(', ')}`,
    };
  }

  return {
    success: true,
    action: 'get_column',
    data: column,
    formatted: formatProjectColumn(column, project.title),
  };
}

// Helper to get project ID via GraphQL
async function getProjectId(owner: string, projectNumber: number): Promise<{ id: string; title: string } | null> {
  // Use gh CLI for simpler approach
  const result = await gh<any>([
    'project', 'view', String(projectNumber),
    '--owner', owner, '--format', 'json'
  ]);
  
  if (result.success && result.data) {
    return { id: result.data.id, title: result.data.title };
  }
  return null;
}

// Helper to get project item ID for an issue
async function getProjectItemId(
  owner: string, 
  repo: string, 
  projectNumber: number, 
  issueNumber: number
): Promise<string | null> {
  // Get project items and find the one matching this issue
  const result = await ghProject.items(owner, projectNumber);
  if (!result.success || !result.data?.items) return null;

  const item = result.data.items.find((i: any) => 
    i.content?.number === issueNumber
  );
  
  return item?.id || null;
}

async function handleListFields(input: GithubProjectInput): Promise<ProjectToolResult> {
  if (!input.project) {
    return { success: false, action: 'list_fields', error: 'Project is required' };
  }

  const [owner] = input.repo.split('/');
  const projectNum = typeof input.project === 'number'
    ? input.project
    : parseInt(input.project, 10);

  if (isNaN(projectNum)) {
    return { success: false, action: 'list_fields', error: 'Project number is required' };
  }

  const result = await gh<any>([
    'project', 'field-list', String(projectNum),
    '--owner', owner, '--format', 'json'
  ]);

  if (!result.success) {
    return { success: false, action: 'list_fields', error: result.error };
  }

  const fields = result.data?.fields || [];
  const lines = ['📋 Project Fields', '─'.repeat(50)];
  
  fields.forEach((f: any) => {
    const options = f.options?.map((o: any) => o.name).join(', ') || '';
    lines.push(`  ${f.name} (${f.type})${options ? `: ${options}` : ''}`);
  });

  return {
    success: true,
    action: 'list_fields',
    data: fields,
    formatted: lines.join('\n'),
  };
}

async function handleSetField(input: GithubProjectInput): Promise<ProjectToolResult> {
  if (!input.project || !input.field || input.fieldValue === undefined) {
    return { success: false, action: 'set_field', error: 'Project, field, and fieldValue are required' };
  }
  
  if (!input.issue && !input.itemId) {
    return { success: false, action: 'set_field', error: 'Either issue number or itemId is required' };
  }

  const [owner, repo] = input.repo.split('/');
  const projectNum = typeof input.project === 'number'
    ? input.project
    : parseInt(input.project, 10);

  // Get item ID if not provided
  let itemId = input.itemId;
  if (!itemId && input.issue) {
    itemId = await getProjectItemId(owner, repo, projectNum, input.issue) ?? undefined;
    if (!itemId) {
      return { success: false, action: 'set_field', error: `Issue #${input.issue} not found in project` };
    }
  }

  // Use gh project item-edit
  const args = [
    'project', 'item-edit',
    '--project-id', String(projectNum),
    '--owner', owner,
    '--id', itemId!,
    '--field-id', input.field,
  ];

  // Determine field type and add appropriate flag
  // For single-select fields, we need to use --single-select-option-id
  // For text/number, use --text or --number
  // Default to text for simplicity
  args.push('--text', input.fieldValue);

  const result = await gh<string>(args);

  if (!result.success) {
    // Try with single-select if text fails
    const retryArgs = [
      'project', 'item-edit',
      '--project-id', String(projectNum),
      '--owner', owner,
      '--id', itemId!,
      '--field-id', input.field,
      '--single-select-option-id', input.fieldValue,
    ];
    
    const retryResult = await gh<string>(retryArgs);
    if (!retryResult.success) {
      return { success: false, action: 'set_field', error: result.error };
    }
  }

  return {
    success: true,
    action: 'set_field',
    formatted: `✅ Set ${input.field} = "${input.fieldValue}" on ${input.issue ? `#${input.issue}` : itemId}`,
  };
}

async function handleMoveItem(input: GithubProjectInput): Promise<ProjectToolResult> {
  if (!input.project || !input.issue || !input.to) {
    return { success: false, action: 'move', error: 'Project, issue, and target column are required' };
  }

  // Use set_field with Status field
  return handleSetField({
    ...input,
    field: 'Status',
    fieldValue: input.to,
  });
}

async function handleAddItem(input: GithubProjectInput): Promise<ProjectToolResult> {
  if (!input.project || !input.issue) {
    return { success: false, action: 'add_item', error: 'Project and issue are required' };
  }

  const [owner, repo] = input.repo.split('/');
  const projectNum = typeof input.project === 'number'
    ? input.project
    : parseInt(input.project, 10);

  const issueUrl = `https://github.com/${owner}/${repo}/issues/${input.issue}`;
  const result = await ghProject.addItem(owner, projectNum, issueUrl);

  if (!result.success) {
    return { success: false, action: 'add_item', error: result.error };
  }

  return {
    success: true,
    action: 'add_item',
    data: result.data,
    formatted: `✅ Added #${input.issue} to project #${projectNum}`,
  };
}

async function handleRemoveItem(input: GithubProjectInput): Promise<ProjectToolResult> {
  if (!input.project) {
    return { success: false, action: 'remove_item', error: 'Project is required' };
  }
  
  if (!input.issue && !input.itemId) {
    return { success: false, action: 'remove_item', error: 'Either issue number or itemId is required' };
  }

  const [owner, repo] = input.repo.split('/');
  const projectNum = typeof input.project === 'number'
    ? input.project
    : parseInt(input.project, 10);

  // Get item ID if not provided
  let itemId = input.itemId;
  if (!itemId && input.issue) {
    itemId = await getProjectItemId(owner, repo, projectNum, input.issue) ?? undefined;
    if (!itemId) {
      return { success: false, action: 'remove_item', error: `Issue #${input.issue} not found in project` };
    }
  }

  const result = await gh<string>([
    'project', 'item-delete', String(projectNum),
    '--owner', owner,
    '--id', itemId!
  ]);

  if (!result.success) {
    return { success: false, action: 'remove_item', error: result.error };
  }

  return {
    success: true,
    action: 'remove_item',
    formatted: `✅ Removed ${input.issue ? `#${input.issue}` : itemId} from project #${projectNum}`,
  };
}

async function handleCreateDraft(input: GithubProjectInput): Promise<ProjectToolResult> {
  if (!input.project || !input.title) {
    return { success: false, action: 'create_draft', error: 'Project and title are required' };
  }

  const [owner] = input.repo.split('/');
  const projectNum = typeof input.project === 'number'
    ? input.project
    : parseInt(input.project, 10);

  const args = [
    'project', 'item-create', String(projectNum),
    '--owner', owner,
    '--title', input.title,
    '--format', 'json'
  ];

  if (input.body) args.push('--body', input.body);

  const result = await gh<any>(args);

  if (!result.success) {
    return { success: false, action: 'create_draft', error: result.error };
  }

  return {
    success: true,
    action: 'create_draft',
    data: result.data,
    formatted: `✅ Created draft issue "${input.title}" in project #${projectNum}`,
  };
}
