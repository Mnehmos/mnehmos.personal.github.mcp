/**
 * Chat-friendly formatters for GitHub issues.
 * Designed for terminal/chat display with box-drawing characters.
 */

import type { IssueJson } from '../cli.js';

// Priority detection from labels
function getPriority(labels: Array<{ name: string }>): {
  level: 'critical' | 'high' | 'medium' | 'low' | 'none';
  emoji: string;
} {
  const labelNames = labels.map(l => l.name.toLowerCase());

  if (labelNames.some(l => l.includes('critical') || l.includes('p0'))) {
    return { level: 'critical', emoji: '\u{1F534}' };  // red circle
  }
  if (labelNames.some(l => l.includes('high') || l.includes('p1'))) {
    return { level: 'high', emoji: '\u{1F7E0}' };      // orange circle
  }
  if (labelNames.some(l => l.includes('medium') || l.includes('p2'))) {
    return { level: 'medium', emoji: '\u{1F7E1}' };    // yellow circle
  }
  if (labelNames.some(l => l.includes('low') || l.includes('p3'))) {
    return { level: 'low', emoji: '\u26AA' };          // white circle
  }
  return { level: 'none', emoji: '\u2B1C' };           // white square
}

// Type detection from labels
function getType(labels: Array<{ name: string }>): { name: string; emoji: string } {
  const labelNames = labels.map(l => l.name.toLowerCase());

  if (labelNames.some(l => l.includes('bug'))) return { name: 'Bug', emoji: '\u{1F41B}' };
  if (labelNames.some(l => l.includes('enhancement') || l.includes('feature'))) {
    return { name: 'Feature', emoji: '\u2728' };
  }
  if (labelNames.some(l => l.includes('documentation') || l.includes('docs'))) {
    return { name: 'Docs', emoji: '\u{1F4DA}' };
  }
  if (labelNames.some(l => l.includes('research') || l.includes('spike'))) {
    return { name: 'Research', emoji: '\u{1F50D}' };
  }
  if (labelNames.some(l => l.includes('idea'))) return { name: 'Idea', emoji: '\u{1F4A1}' };
  if (labelNames.some(l => l.includes('todo') || l.includes('task'))) {
    return { name: 'Task', emoji: '\u2705' };
  }
  return { name: 'Issue', emoji: '\u{1F4CB}' };
}

// Time ago helper
function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Format a single issue for chat display.
 */
export function formatIssue(issue: IssueJson, options: {
  includeBody?: boolean;
  includeComments?: boolean;
  maxBodyLines?: number;
  maxComments?: number;
} = {}): string {
  const {
    includeBody = true,
    includeComments = true,
    maxBodyLines = 10,
    maxComments = 3,
  } = options;

  const stateEmoji = issue.state.toLowerCase() === 'open' ? '\u{1F7E2}' : '\u{1F534}';
  const priority = getPriority(issue.labels);
  const type = getType(issue.labels);
  const assigneeStr = issue.assignees.length > 0
    ? issue.assignees.map(a => `@${a.login}`).join(', ')
    : 'Unassigned';
  const milestoneStr = issue.milestone?.title || 'None';
  const labels = issue.labels.map(l => `[${l.name}]`).join(' ');

  const lines: string[] = [];

  // Header box
  lines.push('\u250C' + '\u2500'.repeat(60) + '\u2510');
  lines.push(`\u2502 #${issue.number} ${truncate(issue.title, 52)}`.padEnd(61) + '\u2502');
  lines.push('\u251C' + '\u2500'.repeat(60) + '\u2524');

  // State row
  lines.push(`\u2502 State: ${stateEmoji} ${issue.state.charAt(0).toUpperCase() + issue.state.slice(1)}    Priority: ${priority.emoji} ${priority.level.charAt(0).toUpperCase() + priority.level.slice(1)}    Type: ${type.emoji} ${type.name}`.padEnd(61) + '\u2502');

  // Assignee row
  lines.push(`\u2502 Assignee: ${truncate(assigneeStr, 20)}    Milestone: ${truncate(milestoneStr, 15)}`.padEnd(61) + '\u2502');

  // Labels
  if (labels) {
    lines.push('\u251C' + '\u2500'.repeat(60) + '\u2524');
    lines.push(`\u2502 Labels: ${truncate(labels, 50)}`.padEnd(61) + '\u2502');
  }

  // Links & meta
  lines.push('\u251C' + '\u2500'.repeat(60) + '\u2524');
  lines.push(`\u2502 \u{1F4AC} Comments: ${issue.comments.length}    \u{1F4C5} Updated: ${timeAgo(issue.updatedAt)}`.padEnd(61) + '\u2502');

  lines.push('\u2514' + '\u2500'.repeat(60) + '\u2518');

  // Body
  if (includeBody && issue.body) {
    lines.push('');
    lines.push('\u{1F4DD} Description:');
    const bodyLines = issue.body.split('\n').slice(0, maxBodyLines);
    bodyLines.forEach(line => {
      lines.push('   ' + truncate(line, 57));
    });
    if (issue.body.split('\n').length > maxBodyLines) {
      lines.push('   ...(truncated)');
    }
  }

  // Latest comments
  if (includeComments && issue.comments.length > 0) {
    lines.push('');
    const recentComments = issue.comments.slice(-maxComments);
    recentComments.forEach(comment => {
      lines.push(`\u{1F4AC} ${timeAgo(comment.createdAt)} by @${comment.author.login}:`);
      const commentLines = comment.body.split('\n').slice(0, 3);
      commentLines.forEach(line => {
        lines.push('   ' + truncate(line, 57));
      });
    });
  }

  return lines.join('\n');
}

/**
 * Format a list of issues as a compact table.
 */
export function formatIssueList(issues: IssueJson[], options: {
  showLabels?: boolean;
  maxTitleLength?: number;
} = {}): string {
  const { showLabels = true, maxTitleLength = 40 } = options;

  if (issues.length === 0) {
    return 'No issues found.';
  }

  const lines: string[] = [];

  // Header
  lines.push('\u{1F4CB} Issues');
  lines.push('\u2500'.repeat(70));
  lines.push(' #     State  Title' + ' '.repeat(maxTitleLength - 4) + (showLabels ? 'Labels' : ''));
  lines.push('\u2500'.repeat(70));

  // Rows
  issues.forEach(issue => {
    const stateEmoji = issue.state.toLowerCase() === 'open' ? '\u{1F7E2}' : '\u{1F534}';
    const num = String(issue.number).padStart(5);
    const title = truncate(issue.title, maxTitleLength);
    const labelStr = showLabels
      ? issue.labels.slice(0, 3).map(l => `[${truncate(l.name, 10)}]`).join(' ')
      : '';

    lines.push(` ${num}  ${stateEmoji}     ${title.padEnd(maxTitleLength)}  ${labelStr}`);
  });

  lines.push('\u2500'.repeat(70));
  lines.push(`Total: ${issues.length} issues`);

  return lines.join('\n');
}

/**
 * Format issue search results with relevance context.
 */
export function formatSearchResults(issues: IssueJson[], query: string): string {
  if (issues.length === 0) {
    return `No issues found matching "${query}"`;
  }

  const lines: string[] = [];
  lines.push(`\u{1F50D} Search: "${query}"`);
  lines.push(`Found ${issues.length} issues`);
  lines.push('\u2500'.repeat(60));

  issues.forEach((issue, idx) => {
    const stateEmoji = issue.state.toLowerCase() === 'open' ? '\u{1F7E2}' : '\u{1F534}';
    const priority = getPriority(issue.labels);
    lines.push(`${idx + 1}. ${stateEmoji} #${issue.number} ${truncate(issue.title, 45)}`);
    lines.push(`   ${priority.emoji} ${issue.labels.map(l => l.name).join(', ') || 'No labels'}`);
    lines.push(`   Updated: ${timeAgo(issue.updatedAt)}`);
    lines.push('');
  });

  return lines.join('\n');
}

// Helper
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}
