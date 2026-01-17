/**
 * Chat-friendly formatters for GitHub Projects.
 * Kanban board visualization for terminal/chat display.
 */
/**
 * Format a project board as ASCII kanban.
 */
export function formatProjectBoard(project, options = {}) {
    const { maxItemsPerColumn = 5, columnWidth = 22 } = options;
    const lines = [];
    // Header
    lines.push(`\u{1F4CB} Project: ${project.title}`);
    if (project.shortDescription) {
        lines.push(`   ${project.shortDescription}`);
    }
    lines.push('\u2550'.repeat(project.columns.length * (columnWidth + 3)));
    lines.push('');
    // Column headers
    const headerRow = project.columns
        .map(col => {
        const name = truncate(col.name, columnWidth - 4);
        const count = col.items.length;
        return `${name} (${count})`.padEnd(columnWidth);
    })
        .join('   ');
    lines.push(headerRow);
    // Separator
    const separator = project.columns
        .map(() => '\u2500'.repeat(columnWidth))
        .join('   ');
    lines.push(separator);
    // Items
    const maxRows = Math.max(...project.columns.map(c => Math.min(c.items.length, maxItemsPerColumn)));
    for (let i = 0; i < maxRows; i++) {
        const row = project.columns
            .map(col => {
            const item = col.items[i];
            if (!item)
                return ' '.repeat(columnWidth);
            const prefix = item.type === 'Issue' ? `#${item.number}` : '\u{1F4DD}';
            const title = truncate(item.title, columnWidth - 6);
            return `${prefix} ${title}`.padEnd(columnWidth);
        })
            .join('   ');
        lines.push(row);
    }
    // Overflow indicators
    const overflowRow = project.columns
        .map(col => {
        const overflow = col.items.length - maxItemsPerColumn;
        if (overflow > 0) {
            return `...+${overflow} more`.padEnd(columnWidth);
        }
        return ' '.repeat(columnWidth);
    })
        .join('   ');
    if (overflowRow.trim()) {
        lines.push(overflowRow);
    }
    // Footer
    lines.push('');
    lines.push('\u2500'.repeat(project.columns.length * (columnWidth + 3)));
    lines.push(`Total: ${project.totalItems} items | ${project.url}`);
    // Legend
    lines.push('');
    lines.push('Legend: \u{1F534} Critical  \u{1F7E0} High  \u{1F7E1} Medium  \u26AA Low');
    return lines.join('\n');
}
/**
 * Format a single column view.
 */
export function formatProjectColumn(column, projectTitle) {
    const lines = [];
    lines.push(`\u{1F4CB} ${projectTitle} > ${column.name}`);
    lines.push('\u2500'.repeat(50));
    lines.push(`${column.items.length} items`);
    lines.push('');
    if (column.items.length === 0) {
        lines.push('   (empty)');
        return lines.join('\n');
    }
    column.items.forEach((item, idx) => {
        const prefix = item.type === 'Issue' ? `#${item.number}` : '\u{1F4DD}';
        lines.push(`${idx + 1}. ${prefix} ${item.title}`);
        if (item.assignees.length > 0) {
            lines.push(`   Assignees: ${item.assignees.join(', ')}`);
        }
        if (item.labels.length > 0) {
            lines.push(`   Labels: ${item.labels.map(l => `[${l}]`).join(' ')}`);
        }
        lines.push('');
    });
    return lines.join('\n');
}
/**
 * Format project list.
 */
export function formatProjectList(projects) {
    if (projects.length === 0) {
        return 'No projects found.';
    }
    const lines = [];
    lines.push('\u{1F4CB} Projects');
    lines.push('\u2500'.repeat(50));
    projects.forEach(p => {
        lines.push(`#${p.number} ${p.title}`);
        lines.push(`   ${p.url}`);
    });
    return lines.join('\n');
}
// Helper
function truncate(str, maxLen) {
    if (str.length <= maxLen)
        return str;
    return str.slice(0, maxLen - 3) + '...';
}
//# sourceMappingURL=project.js.map