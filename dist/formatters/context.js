/**
 * Chat-friendly formatters for context reconstruction output.
 */
/**
 * Format full session context for agent consumption.
 */
export function formatActiveContext(ctx) {
    const lines = [];
    // Header
    lines.push("\u{1F3AE} Session Context");
    lines.push(`Repository: ${ctx.repo}`);
    lines.push(`Timestamp: ${ctx.timestamp}`);
    lines.push("\u2550".repeat(60));
    // Current Focus
    if (ctx.currentFocus) {
        lines.push("");
        lines.push("\u{1F3AF} Current Focus:");
        lines.push(`   #${ctx.currentFocus.number} ${ctx.currentFocus.title}`);
        lines.push(`   ${ctx.currentFocus.url}`);
    }
    // Blockers (important!)
    if (ctx.blockers.length > 0) {
        lines.push("");
        lines.push("\u{1F6A8} BLOCKERS:");
        ctx.blockers.forEach((b) => {
            const blockingStr = b.blocking.length > 0
                ? ` (blocks: ${b.blocking.map((n) => `#${n}`).join(", ")})`
                : "";
            lines.push(`   \u{1F534} #${b.number} ${b.title}${blockingStr}`);
        });
    }
    // In Progress
    if (ctx.inProgress.length > 0) {
        lines.push("");
        lines.push("\u{1F504} In Progress:");
        ctx.inProgress.forEach((task) => {
            lines.push(`   \u{1F7E0} #${task.number} ${truncate(task.title, 40)}`);
            lines.push(`      Assignee: ${task.assignee} | Started: ${task.startedAt}`);
        });
    }
    // Active Tasks
    if (ctx.activeTasks.length > 0) {
        lines.push("");
        lines.push("\u{1F4CB} Active Tasks:");
        ctx.activeTasks.forEach((task) => {
            const prioEmoji = getPriorityEmoji(task.priority);
            lines.push(`   ${prioEmoji} #${task.number} ${truncate(task.title, 40)}`);
            if (task.labels.length > 0) {
                lines.push(`      Labels: ${task.labels.join(", ")}`);
            }
        });
    }
    // Recent Comments
    if (ctx.recentComments.length > 0) {
        lines.push("");
        lines.push("\u{1F4AC} Recent Activity:");
        ctx.recentComments.slice(0, 5).forEach((c) => {
            lines.push(`   #${c.issue} @${c.author} (${c.createdAt}):`);
            lines.push(`      "${truncate(c.body.replace(/\n/g, " "), 50)}"`);
        });
    }
    // Milestones
    if (ctx.milestones.length > 0) {
        lines.push("");
        lines.push("\u{1F3C1} Milestones:");
        ctx.milestones.forEach((m) => {
            const total = m.progress.open + m.progress.closed;
            const pct = total > 0 ? Math.round((m.progress.closed / total) * 100) : 0;
            const bar = progressBar(pct);
            const due = m.dueOn ? ` | Due: ${m.dueOn}` : "";
            lines.push(`   ${m.title}: ${bar} ${pct}% (${m.progress.closed}/${total})${due}`);
        });
    }
    // Pull Requests
    if (ctx.pullRequests.length > 0) {
        lines.push("");
        lines.push("\u{1F500} Open Pull Requests:");
        ctx.pullRequests.forEach((pr) => {
            const statusEmoji = pr.reviewStatus === "APPROVED"
                ? "\u2705"
                : pr.reviewStatus === "CHANGES_REQUESTED"
                    ? "\u{1F534}"
                    : "\u{1F7E1}";
            lines.push(`   ${statusEmoji} #${pr.number} ${truncate(pr.title, 40)} (@${pr.author})`);
        });
    }
    lines.push("");
    lines.push("\u2550".repeat(60));
    return lines.join("\n");
}
/**
 * Format a compact context summary for injection into prompts.
 */
export function formatContextSummary(ctx) {
    const parts = [];
    if (ctx.currentFocus) {
        parts.push(`Focus: #${ctx.currentFocus.number} ${ctx.currentFocus.title}`);
    }
    if (ctx.blockers.length > 0) {
        parts.push(`Blockers: ${ctx.blockers.map((b) => `#${b.number}`).join(", ")}`);
    }
    if (ctx.inProgress.length > 0) {
        parts.push(`In Progress: ${ctx.inProgress.map((t) => `#${t.number}`).join(", ")}`);
    }
    if (ctx.activeTasks.length > 0) {
        parts.push(`Tasks: ${ctx.activeTasks.length} active`);
    }
    return parts.join(" | ");
}
/**
 * Format blockers with urgency.
 */
export function formatBlockers(blockers) {
    if (blockers.length === 0) {
        return "\u2705 No blockers!";
    }
    const lines = ["\u{1F6A8} BLOCKERS REQUIRING ATTENTION:"];
    lines.push("\u2500".repeat(50));
    blockers.forEach((b) => {
        lines.push(`\u{1F534} #${b.number}: ${b.title}`);
        if (b.blocking.length > 0) {
            lines.push(`   Blocks: ${b.blocking.map((n) => `#${n}`).join(", ")}`);
        }
    });
    return lines.join("\n");
}
// Helpers
function truncate(str, maxLen) {
    if (str.length <= maxLen)
        return str;
    return str.slice(0, maxLen - 3) + "...";
}
function getPriorityEmoji(priority) {
    switch (priority) {
        case "critical":
            return "\u{1F534}";
        case "high":
            return "\u{1F7E0}";
        case "medium":
            return "\u{1F7E1}";
        case "low":
            return "\u26AA";
        default:
            return "\u2B1C";
    }
}
function progressBar(percent, width = 10) {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    return "\u2588".repeat(filled) + "\u2591".repeat(empty);
}
//# sourceMappingURL=context.js.map