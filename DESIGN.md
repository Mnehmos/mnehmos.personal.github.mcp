# mnehmos.github.mcp — Design Document

## North Star

> **"A tool for coding agents to externalize state."**

GitHub becomes the persistent brain; the agent is the stateless hands. Issues are atomic tasks. Projects are workflow state. Wiki is institutional memory. The agent reconstructs context from queries, acts, and persists results—all through `gh` CLI.

---

## Core Philosophy Alignment

| Mnehmos Principle | GitHub Implementation |
|-------------------|----------------------|
| Database is intelligence | GitHub Issues/Projects/Wiki = persistent state |
| Agent is hands | MCP tools = stateless executors via `gh` CLI |
| LLM describes, engine validates | Zod schemas validate before `gh` execution |
| Scalpel, not hammer | Targeted queries, batch operations, minimal context |

---

## Six Stateful MCP Patterns Applied

### Pattern 1: Externalize State to Persistent Storage

**Storage Layers:**

| Layer | GitHub Feature | Purpose |
|-------|---------------|---------|
| Active Context | Pinned Issue + Project Board | Current focus, active tasks |
| Task Queue | Issues with labels | Atomic todos, research items, ideas |
| Workflow State | Project columns/status | Kanban progression |
| Knowledge Base | Wiki pages | Persistent documentation, decisions |
| Audit Trail | Issue comments + commit refs | Change history, provenance |
| Relationships | Issue references (#123) | Dependency graphs, blockers |

**Active Context Schema:**
```typescript
interface ActiveContext {
  repo: string;                    // "Mnehmos/mnehmos.nls.lang"
  currentFocus: Issue | null;      // Pinned/assigned issue
  inProgress: Issue[];             // Issues in "In Progress" column
  blockers: Issue[];               // Issues labeled "blocker"
  recentActivity: ActivityEvent[]; // Last N events
}
```

### Pattern 2: Rich Query Tools for Context Reconstruction

**Context Reconstruction Tools:**

| Tool | Purpose | Returns |
|------|---------|---------|
| `github_get_context` | Full session state | Active tasks, blockers, recent activity |
| `github_search_issues` | Semantic + label search | Filtered issue list with relevance |
| `github_get_relationships` | Dependency graph | Issues blocking/blocked-by |
| `github_get_timeline` | Activity history | Recent comments, state changes |

**Example Query:**
```typescript
// Agent starts session - reconstructs context in ONE call
const context = await github_get_context({
  repo: "Mnehmos/mnehmos.nls.lang",
  include: ["active_tasks", "blockers", "recent_comments"],
  limit: { tasks: 10, comments: 20 }
});
```

### Pattern 3: Composite Operations

**Unified Issue Manager:**
```typescript
// Single tool, action-driven
github_issue({
  action: "create" | "get" | "update" | "close" | "reopen" | "assign" |
          "label" | "comment" | "link" | "search" | "batch_update",
  repo: string,
  // Action-specific params...
})
```

**Batch Operations:**
```typescript
// Process multiple issues in one call
github_issue({
  action: "batch_update",
  repo: "Mnehmos/mnehmos.nls.lang",
  operations: [
    { issue: 42, labels: { add: ["in-progress"], remove: ["todo"] } },
    { issue: 43, assignees: { add: ["@me"] } },
    { issue: 44, state: "closed" }
  ]
})
```

**Workflow Transitions:**
```typescript
// Move through project board + update issue in one call
github_workflow({
  action: "transition",
  repo: "Mnehmos/mnehmos.nls.lang",
  issue: 42,
  from: "Todo",
  to: "In Progress",
  comment: "Starting work on auth refactor"
})
```

### Pattern 4: Fuzzy Validation for LLM Tolerance

**Label Fuzzy Matching:**
```typescript
// LLM says "in progress" → matches "in-progress"
// LLM says "bugfix" → matches "bug"
// LLM says "high pri" → matches "priority:high"

const LABEL_ALIASES = {
  "in progress": "in-progress",
  "wip": "in-progress",
  "bugfix": "bug",
  "feature request": "enhancement",
  "high pri": "priority:high",
  "p0": "priority:critical",
};
```

**State Normalization:**
```typescript
// Accept variations
// "open", "Open", "OPEN", "active" → "open"
// "closed", "done", "completed", "resolved" → "closed"
```

### Pattern 5: Fork/Snapshot Synchronization

**Draft Mode for Complex Operations:**
```typescript
// Create issue in draft state, finalize when ready
const draft = await github_issue({
  action: "create_draft",
  repo: "Mnehmos/mnehmos.nls.lang",
  title: "Implement auth module",
  body: "WIP - gathering requirements"
});

// ... agent gathers more context ...

await github_issue({
  action: "publish_draft",
  draftId: draft.id,
  body: "Full specification here...",
  labels: ["feature", "auth"]
});
```

**Atomic Multi-Issue Updates:**
```typescript
// All succeed or all fail
github_transaction({
  operations: [
    { action: "close", issue: 41 },
    { action: "create", title: "Follow-up: Deploy auth", labels: ["deploy"] },
    { action: "comment", issue: 40, body: "Blocked by new deploy task" }
  ],
  rollbackOnFailure: true
})
```

### Pattern 6: Chat-First Output Design

**Issue Display Format:**
```
┌─────────────────────────────────────────────────────────┐
│ #42 Implement OAuth2 authentication                     │
├─────────────────────────────────────────────────────────┤
│ State: 🟢 Open    Priority: 🔴 High    Type: ✨ Feature │
│ Assignee: @mnehmos    Milestone: v0.2.0                 │
├─────────────────────────────────────────────────────────┤
│ Labels: [auth] [security] [in-progress]                 │
├─────────────────────────────────────────────────────────┤
│ 📎 Linked: #40 (blocks), #38 (related)                  │
│ 💬 Comments: 5    📅 Updated: 2h ago                    │
└─────────────────────────────────────────────────────────┘

📝 Description:
   Implement OAuth2 flow for GitHub and Google providers.

   Tasks:
   - [x] Research OAuth2 libraries
   - [ ] Implement GitHub provider
   - [ ] Implement Google provider
   - [ ] Add token refresh logic

💬 Latest Comment (2h ago by @mnehmos):
   "Decided on passport.js for OAuth handling"
```

**Project Board View:**
```
📋 Project: NLS Language Development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📥 Todo (3)              🔄 In Progress (2)      ✅ Done (8)
─────────────────────    ─────────────────────   ─────────────
#45 Add error types      #42 OAuth2 auth         #38 Lexer
#46 Parser improvements  #43 Token refresh       #39 AST nodes
#47 REPL mode                                    #40 Type system
                                                 ...+5 more

Legend: 🔴 Critical  🟠 High  🟡 Medium  ⚪ Low
```

---

## Tool Inventory

### Core Issue Operations

| Tool | Action | Description |
|------|--------|-------------|
| `github_issue` | `create` | Create new issue with labels, assignees, milestone |
| | `get` | Fetch issue with full details |
| | `update` | Modify title, body, labels, assignees |
| | `close` | Close with optional comment |
| | `reopen` | Reopen closed issue |
| | `comment` | Add comment to issue |
| | `search` | Search with filters and full-text |
| | `batch_update` | Update multiple issues atomically |

### Project/Workflow Operations

| Tool | Action | Description |
|------|--------|-------------|
| `github_project` | `get` | Get project board state |
| | `move` | Move issue between columns |
| | `create_item` | Add issue to project |
| | `get_column` | List items in specific column |

### Context Operations

| Tool | Action | Description |
|------|--------|-------------|
| `github_context` | `get` | Full session context reconstruction |
| | `set_focus` | Pin current working issue |
| | `get_blockers` | List blocking issues |
| | `get_timeline` | Recent activity feed |

### Wiki Operations

| Tool | Action | Description |
|------|--------|-------------|
| `github_wiki` | `get` | Read wiki page |
| | `update` | Update wiki page |
| | `create` | Create new wiki page |
| | `search` | Search wiki content |
| | `list` | List all wiki pages |

### Relationship Operations

| Tool | Action | Description |
|------|--------|-------------|
| `github_links` | `add` | Link issues (blocks, relates, duplicates) |
| | `remove` | Remove link |
| | `get_graph` | Get dependency graph for issue |
| | `find_cycles` | Detect circular dependencies |

---

## Tool Schemas

### github_issue

```typescript
const GithubIssueSchema = z.object({
  action: z.enum([
    "create", "get", "update", "close", "reopen",
    "comment", "search", "batch_update", "list"
  ]),
  repo: z.string().describe("Owner/repo format"),

  // For get, update, close, reopen, comment
  issue: z.number().optional().describe("Issue number"),

  // For create, update
  title: z.string().optional(),
  body: z.string().optional(),
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
  milestone: z.string().optional(),

  // For comment
  comment: z.string().optional(),

  // For search
  query: z.string().optional(),
  filters: z.object({
    state: z.enum(["open", "closed", "all"]).optional(),
    labels: z.array(z.string()).optional(),
    assignee: z.string().optional(),
    author: z.string().optional(),
    mentions: z.string().optional(),
    milestone: z.string().optional(),
    created: z.string().optional(), // ">2024-01-01"
    updated: z.string().optional(),
    sort: z.enum(["created", "updated", "comments"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }).optional(),
  limit: z.number().default(30),

  // For batch_update
  operations: z.array(z.object({
    issue: z.number(),
    labels: z.object({
      add: z.array(z.string()).optional(),
      remove: z.array(z.string()).optional(),
    }).optional(),
    assignees: z.object({
      add: z.array(z.string()).optional(),
      remove: z.array(z.string()).optional(),
    }).optional(),
    state: z.enum(["open", "closed"]).optional(),
    comment: z.string().optional(),
  })).optional(),
});
```

### github_context

```typescript
const GithubContextSchema = z.object({
  action: z.enum(["get", "set_focus", "get_blockers", "get_timeline"]),
  repo: z.string(),

  // For set_focus
  issue: z.number().optional(),

  // For get
  include: z.array(z.enum([
    "active_tasks",      // Issues assigned to @me, state:open
    "blockers",          // Issues with "blocker" label
    "recent_comments",   // Latest comments across issues
    "in_progress",       // Issues in "In Progress" project column
    "milestones",        // Active milestones with progress
    "prs",              // Open pull requests
  ])).optional().default(["active_tasks", "blockers"]),

  limit: z.object({
    tasks: z.number().default(10),
    comments: z.number().default(10),
    prs: z.number().default(5),
  }).optional(),
});
```

### github_project

```typescript
const GithubProjectSchema = z.object({
  action: z.enum(["get", "move", "create_item", "get_column", "list"]),
  repo: z.string(),
  project: z.string().optional().describe("Project name or number"),

  // For move
  issue: z.number().optional(),
  from: z.string().optional(),
  to: z.string().optional(),

  // For get_column
  column: z.string().optional(),

  // For create_item
  contentId: z.string().optional(), // Issue or PR node ID
});
```

### github_wiki

```typescript
const GithubWikiSchema = z.object({
  action: z.enum(["get", "update", "create", "search", "list"]),
  repo: z.string(),

  // For get, update
  page: z.string().optional().describe("Page slug (e.g., 'Home', 'Architecture')"),

  // For update, create
  content: z.string().optional(),
  message: z.string().optional().describe("Commit message for wiki change"),

  // For search
  query: z.string().optional(),
});
```

---

## Implementation Architecture

```
mnehmos.github.mcp/
├── src/
│   ├── index.ts              # MCP server entry, tool registration
│   ├── cli.ts                # gh CLI wrapper with error handling
│   ├── schemas/
│   │   ├── issue.ts          # Issue-related schemas
│   │   ├── project.ts        # Project schemas
│   │   ├── context.ts        # Context schemas
│   │   └── wiki.ts           # Wiki schemas
│   ├── tools/
│   │   ├── issue.ts          # github_issue implementation
│   │   ├── project.ts        # github_project implementation
│   │   ├── context.ts        # github_context implementation
│   │   ├── wiki.ts           # github_wiki implementation
│   │   └── links.ts          # github_links implementation
│   ├── formatters/
│   │   ├── issue.ts          # Chat-friendly issue formatting
│   │   ├── project.ts        # Board visualization
│   │   └── timeline.ts       # Activity feed formatting
│   ├── fuzzy/
│   │   ├── labels.ts         # Label alias resolution
│   │   └── states.ts         # State normalization
│   └── cache.ts              # Optional response caching
├── tests/
├── package.json
├── tsconfig.json
└── README.md
```

---

## CLI Wrapper Pattern

```typescript
// src/cli.ts
import { execSync, exec } from 'child_process';

interface GhResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  stderr?: string;
}

export async function gh<T>(args: string[]): Promise<GhResult<T>> {
  try {
    const result = execSync(`gh ${args.join(' ')}`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB for large responses
    });

    // Try to parse as JSON
    try {
      return { success: true, data: JSON.parse(result) };
    } catch {
      return { success: true, data: result as unknown as T };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.toString(),
    };
  }
}

// Typed helpers
export const ghIssue = {
  list: (repo: string, filters: string[]) =>
    gh<Issue[]>(['issue', 'list', '-R', repo, '--json', 'number,title,state,labels,assignees,body,comments,createdAt,updatedAt', ...filters]),

  get: (repo: string, number: number) =>
    gh<Issue>(['issue', 'view', '-R', repo, String(number), '--json', 'number,title,state,labels,assignees,body,comments,milestone,projectItems']),

  create: (repo: string, title: string, body: string, labels?: string[], assignees?: string[]) =>
    gh<Issue>(['issue', 'create', '-R', repo, '-t', `"${title}"`, '-b', `"${body}"`,
      ...(labels?.flatMap(l => ['-l', l]) || []),
      ...(assignees?.flatMap(a => ['-a', a]) || []),
      '--json', 'number,url'
    ]),

  // ... more helpers
};
```

---

## Example Workflows

### Agent Session Start
```typescript
// 1. Reconstruct context
const ctx = await github_context({
  action: "get",
  repo: "Mnehmos/mnehmos.nls.lang",
  include: ["active_tasks", "blockers", "in_progress"]
});

// 2. Agent now knows:
//    - What tasks are assigned to it
//    - What's blocking progress
//    - What's currently in flight
```

### Task Lifecycle
```typescript
// 1. Create task from idea
await github_issue({
  action: "create",
  repo: "Mnehmos/mnehmos.nls.lang",
  title: "Research: OAuth2 library options",
  body: "Compare passport.js vs oauth2-client...",
  labels: ["research", "auth", "todo"]
});

// 2. Start working
await github_issue({
  action: "batch_update",
  repo: "Mnehmos/mnehmos.nls.lang",
  operations: [{
    issue: 42,
    labels: { add: ["in-progress"], remove: ["todo"] },
    assignees: { add: ["@me"] }
  }]
});

// 3. Document findings
await github_issue({
  action: "comment",
  repo: "Mnehmos/mnehmos.nls.lang",
  issue: 42,
  comment: "## Research Findings\n\npassport.js is better because..."
});

// 4. Complete
await github_issue({
  action: "close",
  repo: "Mnehmos/mnehmos.nls.lang",
  issue: 42,
  comment: "Research complete. Decision: use passport.js"
});

// 5. Create follow-up
await github_issue({
  action: "create",
  repo: "Mnehmos/mnehmos.nls.lang",
  title: "Implement OAuth2 with passport.js",
  body: "Based on research in #42...",
  labels: ["feature", "auth", "todo"]
});
```

### Knowledge Persistence
```typescript
// Save architectural decision to wiki
await github_wiki({
  action: "update",
  repo: "Mnehmos/mnehmos.nls.lang",
  page: "Architecture-Decisions",
  content: `# ADR-003: OAuth2 Library Selection

## Status
Accepted

## Context
Need OAuth2 for GitHub and Google auth.

## Decision
Use passport.js based on research in #42.

## Consequences
- Mature ecosystem
- Middleware pattern fits our architecture
`,
  message: "ADR-003: OAuth2 library selection"
});
```

---

## Integration with Existing MCPs

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Session                            │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ mnehmos.      │    │ mnehmos.      │    │ mnehmos.      │
│ github.mcp    │    │ synch.mcp     │    │ ooda.mcp      │
│               │    │               │    │               │
│ - Issues      │    │ - Context     │    │ - Files       │
│ - Projects    │    │ - Events      │    │ - CLI         │
│ - Wiki        │    │ - Cabinet     │    │ - Screen      │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ GitHub API    │    │ JSON Files    │    │ Local System  │
│ (via gh CLI)  │    │ (Memory Bank) │    │ (Filesystem)  │
└───────────────┘    └───────────────┘    └───────────────┘

Workflow Example:
1. github_context → Get current task state
2. synch → Load session context
3. ooda → Read/edit files
4. ooda → Run tests
5. github_issue → Comment with results
6. github_issue → Close task
7. synch → Emit completion event
```

---

## Unique Value Proposition

| Aspect | Agent Synch (mnehmos.synch.mcp) | GitHub MCP (mnehmos.github.mcp) |
|--------|--------------------------------|--------------------------------|
| **Storage** | Local JSON files | GitHub cloud |
| **Collaboration** | Single agent | Multi-agent, human-visible |
| **History** | Session-scoped | Permanent audit trail |
| **Discovery** | Agent-only | Searchable by humans |
| **Integration** | Internal | CI/CD, automation, external tools |

**When to use GitHub MCP:**
- Tasks need human review
- Cross-session persistence required
- Audit trail matters
- Integration with CI/CD
- Collaborative workflows

**When to use Agent Synch:**
- Fast, local operations
- Session-specific context
- No external dependencies
- Agent-to-agent handoff

---

## Future Enhancements

1. **Caching Layer**: Cache issue metadata locally for faster queries
2. **Webhook Integration**: React to GitHub events (new issues, comments)
3. **Template System**: Issue templates for common task types
4. **Analytics**: Track velocity, completion rates, blockers over time
5. **AI-Assisted Triage**: Auto-label and prioritize new issues
6. **Cross-Repo Context**: Query across multiple repositories

---

## Summary

The `mnehmos.github.mcp` server transforms GitHub into a persistent brain for coding agents:

- **Issues** = Atomic tasks with full lifecycle tracking
- **Projects** = Workflow state and Kanban progression
- **Wiki** = Institutional memory and architectural decisions
- **Comments** = Audit trail and progress documentation

Following the six stateful MCP patterns:
1. ✅ Externalize state to GitHub
2. ✅ Rich query tools for context reconstruction
3. ✅ Composite operations with action-driven design
4. ✅ Fuzzy validation for LLM tolerance
5. ✅ Fork/snapshot through draft issues
6. ✅ Chat-first output with box-drawing formatting

The agent starts stateless, queries GitHub for context, performs work, and persists results—enabling seamless continuity across sessions and agents.
