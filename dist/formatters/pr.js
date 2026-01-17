/**
 * Chat-friendly formatters for Pull Requests.
 */
export function formatPr(pr) {
    const state = pr.state === 'MERGED' ? '🟣' : pr.state === 'CLOSED' ? '🔴' : '🟢';
    const draft = pr.isDraft ? ' (Draft)' : '';
    const review = pr.reviewDecision ? ` [${pr.reviewDecision}]` : '';
    const lines = [
        `${state} PR #${pr.number}${draft}${review}`,
        `  ${pr.title}`,
        `  ${pr.headRefName} → ${pr.baseRefName}`,
    ];
    if (pr.additions !== undefined || pr.deletions !== undefined) {
        lines.push(`  📊 +${pr.additions || 0} / -${pr.deletions || 0} (${pr.changedFiles || 0} files)`);
    }
    if (pr.assignees?.length) {
        lines.push(`  👤 ${pr.assignees.map(a => `@${a.login}`).join(', ')}`);
    }
    if (pr.labels?.length) {
        lines.push(`  🏷️ ${pr.labels.map(l => l.name).join(', ')}`);
    }
    return lines.join('\n');
}
export function formatPrList(prs) {
    if (prs.length === 0)
        return 'No pull requests found.';
    const lines = ['📋 Pull Requests', '─'.repeat(60)];
    prs.forEach(pr => {
        const state = pr.state === 'MERGED' ? '🟣' : pr.state === 'CLOSED' ? '🔴' : '🟢';
        const draft = pr.isDraft ? '📝' : '';
        const title = pr.title.length > 45 ? pr.title.slice(0, 42) + '...' : pr.title;
        lines.push(`  ${state} #${pr.number} ${draft} ${title}`);
    });
    lines.push('─'.repeat(60));
    lines.push(`Total: ${prs.length} PRs`);
    return lines.join('\n');
}
export function formatPrChecks(checks, prNumber) {
    if (checks.length === 0)
        return `No checks for PR #${prNumber}`;
    const lines = [`🔍 Checks for PR #${prNumber}`, '─'.repeat(50)];
    checks.forEach(c => {
        const icon = c.state === 'SUCCESS' ? '✅' : c.state === 'FAILURE' ? '❌' : c.state === 'PENDING' ? '🟡' : '⚪';
        lines.push(`  ${icon} ${c.name}`);
    });
    const passed = checks.filter(c => c.state === 'SUCCESS').length;
    lines.push('─'.repeat(50));
    lines.push(`${passed}/${checks.length} passed`);
    return lines.join('\n');
}
//# sourceMappingURL=pr.js.map