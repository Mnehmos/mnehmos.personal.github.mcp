# mnehmos.github.mcp

A Model Context Protocol (MCP) server for coding agents to externalize state via GitHub Issues, Projects, and Wiki.

## North Star

> **"A tool for coding agents to externalize state."**

GitHub becomes the persistent brain; the agent is the stateless hands. The agent reconstructs context from queries, acts, and persists results—all through `gh` CLI.

## Philosophy

| Principle | Implementation |
|-----------|---------------|
| **Database is intelligence** | GitHub Issues/Projects/Wiki = persistent state |
| **Agent is hands** | MCP tools = stateless executors via `gh` CLI |
| **LLM describes, engine validates** | Zod schemas validate before `gh` execution |
| **Scalpel, not hammer** | Targeted queries, batch operations, minimal context |

## Installation

```bash
# Clone repository
git clone https://github.com/Mnehmos/mnehmos.personal.github.mcp.git
cd mnehmos.github.mcp

# Install dependencies
npm install

# Build
npm run build

# Ensure gh CLI is authenticated
gh auth status
```

## Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["path/to/mnehmos.github.mcp/dist/index.js"]
    }
  }
}
```

## Tools

### `github_issue`

Manage GitHub issues with composite operations.

**Actions:** `create`, `get`, `update`, `close`, `reopen`, `comment`, `search`, `list`, `batch_update`

```json
// Create a research task
{
  "action": "create",
  "repo": "owner/repo",
  "title": "Research: OAuth2 options",
  "body": "Compare passport.js vs oauth2-client",
  "labels": ["research", "todo"]
}

// Batch update multiple issues
{
  "action": "batch_update",
  "repo": "owner/repo",
  "operations": [
    { "issue": 42, "labels": { "add": ["in-progress"], "remove": ["todo"] } },
    { "issue": 43, "state": "closed", "comment": "Done!" }
  ]
}
```

### `github_context`

Reconstruct session context for agent startup.

**Actions:** `get`, `set_focus`, `get_blockers`, `get_timeline`

```json
// Full context at session start
{
  "action": "get",
  "repo": "owner/repo",
  "include": ["active_tasks", "blockers", "in_progress", "prs"]
}
```

Output:
```
🎮 Session Context
Repository: owner/repo
══════════════════════════════════════════════════════

🚨 BLOCKERS:
   🔴 #45 Database migration fails (blocks: #42, #43)

🔄 In Progress:
   🟠 #42 Implement OAuth2 auth
      Assignee: @mnehmos | Started: 2h ago

📋 Active Tasks:
   🟡 #46 Add error handling
   ⬜ #47 Write tests
```

### `github_project`

Manage GitHub Projects (Kanban boards).

**Actions:** `list`, `get`, `get_column`, `move`, `add_item`, `remove_item`

```json
{
  "action": "get",
  "repo": "owner/repo",
  "project": "Development Board"
}
```

Output:
```
📋 Project: Development Board
══════════════════════════════════════════════════════

📥 Todo (3)              🔄 In Progress (2)      ✅ Done (8)
─────────────────────    ─────────────────────   ─────────────
#45 Add error types      #42 OAuth2 auth         #38 Lexer
#46 Parser fixes         #43 Token refresh       #39 AST nodes
```

### `github_wiki`

Persist documentation and architectural decisions.

**Actions:** `list`, `get`, `create`, `update`, `search`

```json
{
  "action": "create",
  "repo": "owner/repo",
  "page": "ADR-001-Auth",
  "content": "# ADR-001: Authentication\n\n## Decision\nUse OAuth2...",
  "message": "Add ADR-001"
}
```

### `github_links`

Track issue relationships and dependencies.

**Actions:** `add`, `remove`, `get_graph`, `find_blockers`, `find_cycles`

```json
{
  "action": "get_graph",
  "repo": "owner/repo",
  "issue": 42,
  "depth": 2
}
```

Output:
```
🗺️ Dependency Graph for #42
────────────────────────────────────────

Nodes:
  🟢 #42 Implement OAuth2 auth
  🔴 #45 Database migration (blocker)
  🟢 #43 Token refresh

Relationships:
  #42 → blocked_by → #45
  #43 → blocked_by → #42

⚠️ Cycles detected:
  🔄 #42 → #43 → #42
```

## Fuzzy Matching

Labels are automatically normalized:

| Input | Normalized |
|-------|------------|
| `"in progress"`, `"wip"` | `"in-progress"` |
| `"bugfix"`, `"fix"` | `"bug"` |
| `"high pri"`, `"p1"` | `"priority:high"` |
| `"feature request"` | `"enhancement"` |

## Agent Workflow

### Session Start
```typescript
// Reconstruct context in ONE call
const ctx = await github_context({
  action: "get",
  repo: "Mnehmos/my-project",
  include: ["active_tasks", "blockers", "in_progress"]
});
// Agent now knows:
// - What tasks are assigned
// - What's blocking progress
// - What's currently in flight
```

### Task Lifecycle
```typescript
// 1. Create task
await github_issue({ action: "create", repo, title: "Research OAuth2", labels: ["research"] });

// 2. Start working
await github_issue({ action: "batch_update", repo, operations: [
  { issue: 42, labels: { add: ["in-progress"], remove: ["todo"] } }
]});

// 3. Document findings
await github_issue({ action: "comment", repo, issue: 42, comment: "## Findings\n..." });

// 4. Complete
await github_issue({ action: "close", repo, issue: 42, comment: "Done. Decision: passport.js" });

// 5. Create follow-up
await github_issue({ action: "create", repo, title: "Implement OAuth2 with passport.js" });
```

## Development

```bash
# Run in dev mode
npm run dev

# Type check
npm run typecheck

# Run tests
npm test

# Build
npm run build
```

## Requirements

- Node.js 18+
- GitHub CLI (`gh`) authenticated
- Repository access for target operations

## License

MIT

## Related

- [mnehmos.synch.mcp](https://github.com/Mnehmos/mnehmos.synch.mcp) - Local agent memory bank
- [mnehmos.ooda.mcp](https://github.com/Mnehmos/mnehmos.ooda.mcp) - Full computer control
- [Stateful MCP Architecture](https://mnehmos.github.io/Mnehmos/blog/stateful-mcp-architecture/) - Design patterns
