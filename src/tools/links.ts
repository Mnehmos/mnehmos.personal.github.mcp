/**
 * GitHub Issue Links tool implementation.
 * Dependency tracking and relationship management.
 */

import { ghIssue, type IssueJson } from '../cli.js';
import {
  GithubLinksInputSchema,
  type GithubLinksInput,
  type LinkType,
  type IssueNode,
  type IssueLink,
  type DependencyGraph
} from '../schemas/links.js';

export interface LinksToolResult {
  success: boolean;
  action: string;
  data?: any;
  formatted?: string;
  error?: string;
}

// Link keywords in issue bodies
const LINK_PATTERNS: Record<LinkType, RegExp[]> = {
  blocks: [/blocks?\s+#(\d+)/gi, /blocking\s+#(\d+)/gi],
  blocked_by: [/blocked\s+by\s+#(\d+)/gi, /depends\s+on\s+#(\d+)/gi, /waiting\s+on\s+#(\d+)/gi],
  relates: [/relates?\s+to\s+#(\d+)/gi, /related\s+to\s+#(\d+)/gi, /see\s+also\s+#(\d+)/gi],
  duplicates: [/duplicates?\s+#(\d+)/gi, /duplicate\s+of\s+#(\d+)/gi],
  parent: [/parent[:\s]+#(\d+)/gi, /epic[:\s]+#(\d+)/gi],
  child: [/child[:\s]+#(\d+)/gi, /subtask[:\s]+#(\d+)/gi],
};

/**
 * Main links tool handler.
 */
export async function handleLinksTool(input: GithubLinksInput): Promise<LinksToolResult> {
  const parsed = GithubLinksInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      action: input.action,
      error: `Validation error: ${parsed.error.message}`,
    };
  }

  const { action } = parsed.data;

  switch (action) {
    case 'add':
      return handleAddLink(parsed.data);
    case 'remove':
      return handleRemoveLink(parsed.data);
    case 'get_graph':
      return handleGetGraph(parsed.data);
    case 'find_blockers':
      return handleFindBlockers(parsed.data);
    case 'find_cycles':
      return handleFindCycles(parsed.data);
    default:
      return {
        success: false,
        action,
        error: `Unknown action: ${action}`,
      };
  }
}

async function handleAddLink(input: GithubLinksInput): Promise<LinksToolResult> {
  if (!input.source || !input.target || !input.type) {
    return { success: false, action: 'add', error: 'Source, target, and type are required' };
  }

  // Add link by commenting on the source issue
  const linkText = formatLinkText(input.type, input.target);

  const result = await ghIssue.comment(
    input.repo,
    input.source,
    `\u{1F517} ${linkText}`
  );

  if (!result.success) {
    return { success: false, action: 'add', error: result.error };
  }

  return {
    success: true,
    action: 'add',
    data: {
      source: input.source,
      target: input.target,
      type: input.type,
    },
    formatted: `\u{1F517} Added link: #${input.source} ${input.type} #${input.target}`,
  };
}

async function handleRemoveLink(input: GithubLinksInput): Promise<LinksToolResult> {
  // Removing links requires editing issue body or deleting comments
  // This is complex - provide guidance

  return {
    success: true,
    action: 'remove',
    data: {
      note: 'Link removal requires editing the issue body or deleting the comment containing the link.',
    },
    formatted: `\u{1F517} To remove link:
1. Edit issue #${input.source} body to remove link reference
2. Or delete the comment containing the link
3. Visit: https://github.com/${input.repo}/issues/${input.source}`,
  };
}

async function handleGetGraph(input: GithubLinksInput): Promise<LinksToolResult> {
  if (!input.issue) {
    return { success: false, action: 'get_graph', error: 'Issue number is required' };
  }

  const depth = input.depth || 2;
  const visited = new Set<number>();
  const nodes: IssueNode[] = [];
  const edges: IssueLink[] = [];

  // BFS to build graph
  const queue: Array<{ issue: number; currentDepth: number }> = [
    { issue: input.issue, currentDepth: 0 }
  ];

  while (queue.length > 0) {
    const { issue, currentDepth } = queue.shift()!;

    if (visited.has(issue) || currentDepth > depth) continue;
    visited.add(issue);

    // Fetch issue
    const result = await ghIssue.get(input.repo, issue);
    if (!result.success || !result.data) continue;

    const issueData = result.data;

    // Add node
    nodes.push({
      number: issueData.number,
      title: issueData.title,
      state: issueData.state.toLowerCase() as 'open' | 'closed',
      labels: issueData.labels.map(l => l.name),
    });

    // Extract links from body and comments
    const allText = [
      issueData.body || '',
      ...issueData.comments.map(c => c.body)
    ].join('\n');

    for (const [linkType, patterns] of Object.entries(LINK_PATTERNS)) {
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(allText)) !== null) {
          const targetNum = parseInt(match[1], 10);

          edges.push({
            source: issue,
            target: targetNum,
            type: linkType as LinkType,
          });

          if (!visited.has(targetNum) && currentDepth < depth) {
            queue.push({ issue: targetNum, currentDepth: currentDepth + 1 });
          }
        }
      }
    }
  }

  const graph: DependencyGraph = {
    nodes,
    edges,
    cycles: detectCycles(edges),
  };

  return {
    success: true,
    action: 'get_graph',
    data: graph,
    formatted: formatDependencyGraph(graph, input.issue),
  };
}

async function handleFindBlockers(input: GithubLinksInput): Promise<LinksToolResult> {
  if (!input.issue) {
    return { success: false, action: 'find_blockers', error: 'Issue number is required' };
  }

  // Get the issue and extract blocked_by references
  const result = await ghIssue.get(input.repo, input.issue);
  if (!result.success || !result.data) {
    return { success: false, action: 'find_blockers', error: result.error || 'Issue not found' };
  }

  const allText = [
    result.data.body || '',
    ...result.data.comments.map(c => c.body)
  ].join('\n');

  const blockers: number[] = [];
  for (const pattern of LINK_PATTERNS.blocked_by) {
    let match;
    while ((match = pattern.exec(allText)) !== null) {
      blockers.push(parseInt(match[1], 10));
    }
  }

  // Also check for issues that "block" this one
  const searchResult = await ghIssue.search(input.repo, `blocks #${input.issue}`, 50);
  if (searchResult.success && searchResult.data) {
    for (const issue of searchResult.data) {
      if (!blockers.includes(issue.number)) {
        blockers.push(issue.number);
      }
    }
  }

  return {
    success: true,
    action: 'find_blockers',
    data: {
      issue: input.issue,
      blockedBy: blockers,
    },
    formatted: blockers.length > 0
      ? `\u{1F6A7} #${input.issue} is blocked by: ${blockers.map(n => `#${n}`).join(', ')}`
      : `\u2705 #${input.issue} has no blockers!`,
  };
}

async function handleFindCycles(input: GithubLinksInput): Promise<LinksToolResult> {
  // Get all open issues and build dependency graph
  const result = await ghIssue.list(input.repo, { state: 'open', limit: 100 });

  if (!result.success || !result.data) {
    return { success: false, action: 'find_cycles', error: result.error };
  }

  const edges: IssueLink[] = [];

  for (const issue of result.data) {
    const allText = [
      issue.body || '',
      ...issue.comments.map(c => c.body)
    ].join('\n');

    // Only check blocking relationships for cycles
    for (const pattern of [...LINK_PATTERNS.blocks, ...LINK_PATTERNS.blocked_by]) {
      let match;
      while ((match = pattern.exec(allText)) !== null) {
        edges.push({
          source: issue.number,
          target: parseInt(match[1], 10),
          type: 'blocks',
        });
      }
    }
  }

  const cycles = detectCycles(edges);

  return {
    success: true,
    action: 'find_cycles',
    data: { cycles, edgeCount: edges.length },
    formatted: cycles.length > 0
      ? `\u{1F6A8} Found ${cycles.length} dependency cycles:\n${cycles.map(c => `  \u{1F504} ${c.map(n => `#${n}`).join(' \u2192 ')}`).join('\n')}`
      : `\u2705 No dependency cycles found (checked ${edges.length} relationships)`,
  };
}

// Helpers
function formatLinkText(type: LinkType, target: number): string {
  switch (type) {
    case 'blocks': return `Blocks #${target}`;
    case 'blocked_by': return `Blocked by #${target}`;
    case 'relates': return `Related to #${target}`;
    case 'duplicates': return `Duplicate of #${target}`;
    case 'parent': return `Parent: #${target}`;
    case 'child': return `Child of #${target}`;
    default: return `Links to #${target}`;
  }
}

function detectCycles(edges: IssueLink[]): number[][] {
  // Build adjacency list
  const graph = new Map<number, number[]>();
  for (const edge of edges) {
    if (!graph.has(edge.source)) graph.set(edge.source, []);
    graph.get(edge.source)!.push(edge.target);
  }

  const cycles: number[][] = [];
  const visited = new Set<number>();
  const recStack = new Set<number>();

  function dfs(node: number, path: number[]): void {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, path);
      } else if (recStack.has(neighbor)) {
        // Found cycle
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), neighbor]);
        }
      }
    }

    path.pop();
    recStack.delete(node);
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return cycles;
}

function formatDependencyGraph(graph: DependencyGraph, rootIssue: number): string {
  const lines: string[] = [];

  lines.push(`\u{1F5FA}\uFE0F Dependency Graph for #${rootIssue}`);
  lines.push('\u2500'.repeat(40));

  // Nodes
  lines.push('\nNodes:');
  for (const node of graph.nodes) {
    const stateEmoji = node.state === 'open' ? '\u{1F7E2}' : '\u{1F534}';
    lines.push(`  ${stateEmoji} #${node.number} ${node.title.slice(0, 40)}`);
  }

  // Edges
  if (graph.edges.length > 0) {
    lines.push('\nRelationships:');
    for (const edge of graph.edges) {
      lines.push(`  #${edge.source} \u2192 ${edge.type} \u2192 #${edge.target}`);
    }
  }

  // Cycles
  if (graph.cycles.length > 0) {
    lines.push('\n\u26A0\uFE0F Cycles detected:');
    for (const cycle of graph.cycles) {
      lines.push(`  \u{1F504} ${cycle.map(n => `#${n}`).join(' \u2192 ')}`);
    }
  }

  return lines.join('\n');
}
