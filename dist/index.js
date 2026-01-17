#!/usr/bin/env node
/**
 * mnehmos.github.mcp - GitHub MCP Server v0.2.0
 *
 * A Model Context Protocol server for coding agents to externalize state
 * via GitHub Issues, Projects, Wiki, PRs, Labels, Milestones, and more.
 *
 * Philosophy:
 * - Database is intelligence (GitHub stores all state)
 * - Agent is hands (stateless execution via gh CLI)
 * - LLM describes, engine validates (Zod schemas)
 *
 * Repository: https://github.com/Mnehmos/mnehmos.personal.github.mcp
 * Issues: https://github.com/Mnehmos/mnehmos.personal.github.mcp/issues
 *
 * If you encounter bugs or have suggestions, please create an issue!
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
// Phase 1 schemas
import { GithubIssueInputSchema } from './schemas/issue.js';
import { GithubContextInputSchema } from './schemas/context.js';
import { GithubProjectInputSchema } from './schemas/project.js';
import { GithubWikiInputSchema } from './schemas/wiki.js';
import { GithubLinksInputSchema } from './schemas/links.js';
// Phase 2 schemas
import { GithubPrInputSchema } from './schemas/pr.js';
import { GithubLabelInputSchema } from './schemas/label.js';
import { GithubMilestoneInputSchema } from './schemas/milestone.js';
import { GithubSearchInputSchema } from './schemas/search.js';
// Phase 3 schemas
import { GithubNotificationInputSchema } from './schemas/notification.js';
import { GithubReactionInputSchema } from './schemas/reaction.js';
import { GithubStatusInputSchema } from './schemas/status.js';
// Phase 4 schemas
import { GithubActionsInputSchema } from './schemas/actions.js';
// Phase 1 handlers
import { handleIssueTool } from './tools/issue.js';
import { handleContextTool } from './tools/context.js';
import { handleProjectTool } from './tools/project.js';
import { handleWikiTool } from './tools/wiki.js';
import { handleLinksTool } from './tools/links.js';
// Phase 2 handlers
import { handlePrTool } from './tools/pr.js';
import { handleLabelTool } from './tools/label.js';
import { handleMilestoneTool } from './tools/milestone.js';
import { handleSearchTool } from './tools/search.js';
// Phase 3 handlers
import { handleNotificationTool } from './tools/notification.js';
import { handleReactionTool } from './tools/reaction.js';
import { handleStatusTool } from './tools/status.js';
// Phase 4 handlers
import { handleActionsTool } from './tools/actions.js';
// CLI for meta operations
import { gh } from './cli.js';
const SERVER_REPO = 'Mnehmos/mnehmos.personal.github.mcp';
const SERVER_VERSION = '0.2.0';
// Meta tool handler
async function handleMetaTool(input) {
    const action = input.action || 'version';
    switch (action) {
        case 'version':
            return {
                success: true,
                formatted: `🔧 mnehmos.github.mcp v${SERVER_VERSION}\n\n` +
                    `Repository: https://github.com/${SERVER_REPO}\n` +
                    `Tools: 13 (issue, context, project, wiki, links, pr, label, milestone, search, notification, reaction, status, meta)\n\n` +
                    `Use action 'help' for usage documentation or 'report_bug' to report issues.`,
            };
        case 'help':
            return {
                success: true,
                formatted: `📚 GitHub MCP Server Help\n${'─'.repeat(50)}\n\n` +
                    `This server externalizes agent state via GitHub.\n\n` +
                    `**Core Tools:**\n` +
                    `- github_issue: Create, update, search issues\n` +
                    `- github_context: Reconstruct session state\n` +
                    `- github_project: Kanban board management\n` +
                    `- github_links: Issue dependencies\n\n` +
                    `**Extended Tools:**\n` +
                    `- github_pr: Pull request lifecycle\n` +
                    `- github_label/milestone/search: Repo management\n\n` +
                    `**Advanced Tools:**\n` +
                    `- github_notification/reaction/status: Activity tracking\n\n` +
                    `Report bugs: github_meta action=report_bug title="..." body="..."`,
            };
        case 'report_bug':
            if (!input.title) {
                return { success: false, error: 'title is required for bug reports' };
            }
            const labels = input.labels || 'bug';
            const body = `${input.body || 'No description provided.'}\n\n---\n*Reported via github_meta tool v${SERVER_VERSION}*`;
            const result = await gh([
                'issue', 'create', '-R', SERVER_REPO,
                '--title', input.title,
                '--body', body,
                '--label', labels,
            ]);
            if (!result.success) {
                return { success: false, error: result.error };
            }
            return {
                success: true,
                data: result.data,
                formatted: `✅ Bug report created!\n${result.data}`,
            };
        default:
            return { success: false, error: `Unknown action: ${action}. Use: version, help, report_bug` };
    }
}
const server = new Server({
    name: 'mnehmos.github.mcp',
    version: SERVER_VERSION,
}, {
    capabilities: {
        tools: {},
    },
});
// Tool definitions
const TOOLS = [
    // ===== Phase 1: Core =====
    {
        name: 'github_issue',
        description: `Manage GitHub issues - create, read, update, close, search, and batch operations.

Actions: create, get, update, close, reopen, comment, search, list, batch_update
Labels are fuzzy-matched (e.g., "in progress" → "in-progress").`,
        inputSchema: GithubIssueInputSchema,
    },
    {
        name: 'github_context',
        description: `Reconstruct session context from GitHub state.

Actions: get, set_focus, get_blockers, get_timeline
Use at session start to understand current state without reading files.`,
        inputSchema: GithubContextInputSchema,
    },
    {
        name: 'github_project',
        description: `Manage GitHub Projects (Kanban boards).

Actions: list, get, get_column, move, add_item, remove_item`,
        inputSchema: GithubProjectInputSchema,
    },
    {
        name: 'github_wiki',
        description: `Manage GitHub Wiki pages for persistent documentation.

Actions: list, get, create, update, search
Note: Wiki operations require git clone of wiki repo.`,
        inputSchema: GithubWikiInputSchema,
    },
    {
        name: 'github_links',
        description: `Manage issue relationships and dependencies.

Actions: add, remove, get_graph, find_blockers, find_cycles
Link types: blocks, blocked_by, relates, duplicates, parent, child`,
        inputSchema: GithubLinksInputSchema,
    },
    // ===== Phase 2: Extended =====
    {
        name: 'github_pr',
        description: `Manage pull requests - create, review, merge, and monitor.

Actions: list, get, create, merge, close, reopen, ready, review, checks, comment, diff
Review events: approve, comment, request_changes
Merge methods: merge, squash, rebase`,
        inputSchema: GithubPrInputSchema,
    },
    {
        name: 'github_label',
        description: `Manage repository labels - create, edit, delete, clone.

Actions: list, get, create, edit, delete, clone
Use clone to copy labels from another repository.`,
        inputSchema: GithubLabelInputSchema,
    },
    {
        name: 'github_milestone',
        description: `Manage repository milestones for release planning.

Actions: list, get, create, edit, delete
Track progress with open/closed issue counts and due dates.`,
        inputSchema: GithubMilestoneInputSchema,
    },
    {
        name: 'github_search',
        description: `Advanced cross-repo search operations.

Actions: issues, prs, repos, code, commits
Supports GitHub search syntax with filters for state, author, labels, dates, etc.`,
        inputSchema: GithubSearchInputSchema,
    },
    // ===== Phase 3: Advanced =====
    {
        name: 'github_notification',
        description: `Manage GitHub notifications.

Actions: list, get, mark_read, mark_all_read, mark_done, subscribe, unsubscribe
Filter by participating, repo, or date range.`,
        inputSchema: GithubNotificationInputSchema,
    },
    {
        name: 'github_reaction',
        description: `Add or remove reactions on GitHub content.

Actions: add, remove, list, get_summary
Content types: issue, pr, comment, release
Reactions: +1, -1, laugh, confused, heart, hooray, rocket, eyes`,
        inputSchema: GithubReactionInputSchema,
    },
    {
        name: 'github_status',
        description: `Cross-repo activity overview - what needs your attention.

Actions: get, assigned, review_requests, mentions, activity
Use 'get' for full status, or specific actions for filtered views.`,
        inputSchema: GithubStatusInputSchema,
    },
    // ===== Phase 4: CI/CD =====
    {
        name: 'github_actions',
        description: `Manage GitHub Actions workflows and runs.

Actions: list_workflows, list_runs, get_run, run, cancel, rerun, rerun_failed, list_jobs, get_logs
Trigger workflows, monitor runs, view logs, retry failed jobs.`,
        inputSchema: GithubActionsInputSchema,
    },
    // ===== Meta: Self-documentation =====
    {
        name: 'github_meta',
        description: `Server information, help, and bug reporting for this MCP server.

Actions:
- version: Get server version and capabilities
- help: Get usage documentation
- report_bug: Create an issue on the server's public repo

If you encounter issues with this MCP server, use 'report_bug' to help improve it!
Repository: https://github.com/Mnehmos/mnehmos.personal.github.mcp`,
        inputSchema: {
            shape: {
                action: { description: 'Action: version, help, or report_bug' },
                title: { description: 'Bug report title (for report_bug)' },
                body: { description: 'Bug report body with reproduction steps (for report_bug)' },
                labels: { description: 'Bug labels (default: bug)' },
            },
        },
    },
];
// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: TOOLS.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: {
                type: 'object',
                properties: Object.fromEntries(Object.entries(tool.inputSchema.shape).map(([key, value]) => [
                    key,
                    { type: 'string', description: value.description },
                ])),
            },
        })),
    };
});
// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            // Phase 1
            case 'github_issue':
                result = await handleIssueTool(args);
                break;
            case 'github_context':
                result = await handleContextTool(args);
                break;
            case 'github_project':
                result = await handleProjectTool(args);
                break;
            case 'github_wiki':
                result = await handleWikiTool(args);
                break;
            case 'github_links':
                result = await handleLinksTool(args);
                break;
            // Phase 2
            case 'github_pr':
                result = await handlePrTool(args);
                break;
            case 'github_label':
                result = await handleLabelTool(args);
                break;
            case 'github_milestone':
                result = await handleMilestoneTool(args);
                break;
            case 'github_search':
                result = await handleSearchTool(args);
                break;
            // Phase 3
            case 'github_notification':
                result = await handleNotificationTool(args);
                break;
            case 'github_reaction':
                result = await handleReactionTool(args);
                break;
            case 'github_status':
                result = await handleStatusTool(args);
                break;
            // Phase 4
            case 'github_actions':
                result = await handleActionsTool(args);
                break;
            // Meta
            case 'github_meta':
                result = await handleMetaTool(args);
                break;
            default:
                return {
                    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
        const output = result.formatted || JSON.stringify(result.data, null, 2);
        return {
            content: [{ type: 'text', text: result.success ? output : `Error: ${result.error}\n\n${output}` }],
            isError: !result.success,
        };
    }
    catch (error) {
        return {
            content: [{ type: 'text', text: `Tool execution failed: ${error.message}` }],
            isError: true,
        };
    }
});
// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('mnehmos.github.mcp server started (v0.2.0 - Phase 2 & 3)');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map