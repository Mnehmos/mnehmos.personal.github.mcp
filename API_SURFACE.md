# GitHub API Surface Research

> Comprehensive analysis of GitHub's API capabilities for MCP server design.

## Sources

- [GitHub REST API vs GraphQL API](https://docs.github.com/en/rest/about-the-rest-api/comparing-githubs-rest-api-and-graphql-api)
- [GitHub GraphQL Objects](https://docs.github.com/en/graphql/reference/objects)
- [Projects API Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)
- [GitHub Issues API 2025 Updates](https://github.blog/changelog/2025-03-06-github-issues-projects-api-support-for-issues-advanced-search-and-more/)
- [GitHub CLI Manual](https://cli.github.com/manual/gh_api)

---

## API Access Methods

### 1. REST API v3

- Standard HTTP endpoints
- Good for simple CRUD operations
- Requires multiple requests for complex queries

### 2. GraphQL API v4

- Single endpoint with flexible queries
- Fetch exactly what you need
- Required for Projects V2 operations
- Better for complex relationship queries

### 3. GitHub CLI (`gh`)

- Wraps both REST and GraphQL
- Handles authentication automatically
- JSON output with `--json` flag
- GraphQL via `gh api graphql`

---

## Issue API Surface

### REST Endpoints

| Endpoint                                          | Method          | Purpose                                    |
| ------------------------------------------------- | --------------- | ------------------------------------------ |
| `/issues`                                         | GET             | List issues assigned to authenticated user |
| `/orgs/{org}/issues`                              | GET             | List organization issues                   |
| `/repos/{owner}/{repo}/issues`                    | GET             | List repository issues                     |
| `/repos/{owner}/{repo}/issues`                    | POST            | Create issue                               |
| `/repos/{owner}/{repo}/issues/{number}`           | GET             | Get single issue                           |
| `/repos/{owner}/{repo}/issues/{number}`           | PATCH           | Update issue                               |
| `/repos/{owner}/{repo}/issues/{number}/lock`      | PUT/DELETE      | Lock/unlock                                |
| `/repos/{owner}/{repo}/issues/{number}/comments`  | GET/POST        | Comments                                   |
| `/repos/{owner}/{repo}/issues/{number}/labels`    | GET/POST/DELETE | Labels                                     |
| `/repos/{owner}/{repo}/issues/{number}/assignees` | POST/DELETE     | Assignees                                  |
| `/repos/{owner}/{repo}/issues/{number}/timeline`  | GET             | Timeline events                            |
| `/repos/{owner}/{repo}/issues/{number}/reactions` | GET/POST        | Reactions                                  |

### Issue JSON Fields (via `gh issue list --json`)

```json
[
  "assignees",
  "author",
  "body",
  "closedAt",
  "comments",
  "createdAt",
  "id",
  "labels",
  "milestone",
  "number",
  "projectItems",
  "reactionGroups",
  "state",
  "stateReason",
  "title",
  "updatedAt",
  "url"
]
```

### Full Issue Object Fields (from API)

```json
[
  "active_lock_reason",
  "assignee",
  "assignees",
  "author_association",
  "body",
  "closed_at",
  "closed_by",
  "comments",
  "comments_url",
  "created_at",
  "events_url",
  "html_url",
  "id",
  "issue_dependencies_summary",
  "labels",
  "labels_url",
  "locked",
  "milestone",
  "node_id",
  "number",
  "performed_via_github_app",
  "reactions",
  "repository_url",
  "state",
  "state_reason",
  "sub_issues_summary",
  "timeline_url",
  "title",
  "updated_at",
  "url",
  "user"
]
```

### Special Fields (2025)

- `issue_dependencies_summary` - Blocking/blocked-by relationships
- `sub_issues_summary` - Parent/child issue counts
- `state_reason` - Why closed (completed, not_planned)

---

## gh CLI Commands

### Issue Commands

| Command             | Purpose                        | Key Flags                                                              |
| ------------------- | ------------------------------ | ---------------------------------------------------------------------- |
| `gh issue list`     | List issues                    | `--state`, `--label`, `--assignee`, `--limit`, `--json`                |
| `gh issue view`     | View issue                     | `--json`, `--comments`                                                 |
| `gh issue create`   | Create issue                   | `-t`, `-b`, `-l`, `-a`, `-m`, `-p`                                     |
| `gh issue edit`     | Edit issue                     | `--title`, `--body`, `--add-label`, `--remove-label`, `--add-assignee` |
| `gh issue close`    | Close issue                    | `--reason`, `--comment`                                                |
| `gh issue reopen`   | Reopen issue                   |                                                                        |
| `gh issue comment`  | Add comment                    | `-b`                                                                   |
| `gh issue delete`   | Delete issue                   | `--yes`                                                                |
| `gh issue lock`     | Lock conversation              | `-r` (reason)                                                          |
| `gh issue unlock`   | Unlock conversation            |                                                                        |
| `gh issue pin`      | Pin to repo                    |                                                                        |
| `gh issue unpin`    | Unpin                          |                                                                        |
| `gh issue transfer` | Move to another repo           |                                                                        |
| `gh issue develop`  | Create linked branch           |                                                                        |
| `gh issue status`   | Show assigned/mentioned/recent |                                                                        |

### Search Commands

| Command             | Purpose             | Key Flags                                                    |
| ------------------- | ------------------- | ------------------------------------------------------------ |
| `gh search issues`  | Search issues       | `--assignee`, `--label`, `--state`, `--author`, `--mentions` |
| `gh search prs`     | Search PRs          | Similar to issues                                            |
| `gh search repos`   | Search repositories | `--owner`, `--language`                                      |
| `gh search commits` | Search commits      | `--author`, `--repo`                                         |
| `gh search code`    | Search code         | `--repo`, `--language`                                       |

### Search JSON Fields

```json
[
  "assignees",
  "author",
  "authorAssociation",
  "body",
  "closedAt",
  "commentsCount",
  "createdAt",
  "id",
  "isLocked",
  "isPullRequest",
  "labels",
  "number",
  "repository",
  "state",
  "title",
  "updatedAt",
  "url"
]
```

### Advanced Search Syntax

```bash
# Date filters
gh search issues --created ">2024-01-01"
gh search issues --updated "<2024-06-01"

# Numeric filters
gh search issues --comments ">10"
gh search issues --reactions ">50"
gh search issues --interactions ">100"

# Negation
gh search issues -- -label:bug

# Multiple repos
gh search issues --owner cli --owner github

# Sort options
--sort comments|created|updated|interactions|reactions|reactions-+1|reactions-heart
```

---

## Project API Surface (V2)

### gh CLI Commands

| Command                   | Purpose                 |
| ------------------------- | ----------------------- |
| `gh project list`         | List projects           |
| `gh project view`         | View project details    |
| `gh project create`       | Create new project      |
| `gh project edit`         | Edit project settings   |
| `gh project close`        | Close project           |
| `gh project delete`       | Delete project          |
| `gh project copy`         | Copy project            |
| `gh project field-list`   | List custom fields      |
| `gh project field-create` | Create field            |
| `gh project field-delete` | Delete field            |
| `gh project item-list`    | List project items      |
| `gh project item-add`     | Add issue/PR to project |
| `gh project item-create`  | Create draft issue      |
| `gh project item-edit`    | Edit item field values  |
| `gh project item-archive` | Archive item            |
| `gh project item-delete`  | Remove from project     |
| `gh project link`         | Link to repo/team       |
| `gh project unlink`       | Unlink                  |

### GraphQL Mutations

| Mutation                        | Purpose                       |
| ------------------------------- | ----------------------------- |
| `addProjectV2ItemById`          | Add issue/PR to project       |
| `addProjectV2DraftIssue`        | Create draft issue in project |
| `updateProjectV2ItemFieldValue` | Update field value            |
| `updateProjectV2`               | Update project settings       |
| `deleteProjectV2Item`           | Remove item                   |
| `createProjectV2`               | Create project                |

### Field Types

| Type          | Update Syntax                           |
| ------------- | --------------------------------------- |
| Text          | `--text "value"`                        |
| Number        | `--number 42`                           |
| Date          | `--date "2024-06-15"`                   |
| Single Select | `--single-select-option-id "OPTION_ID"` |
| Iteration     | `--iteration-id "ITERATION_ID"`         |

---

## Label API Surface

### gh CLI Commands

| Command           | Purpose                        |
| ----------------- | ------------------------------ |
| `gh label list`   | List all labels                |
| `gh label create` | Create label                   |
| `gh label edit`   | Edit label                     |
| `gh label delete` | Delete label                   |
| `gh label clone`  | Clone labels from another repo |

### Label Object Fields

```json
["color", "default", "description", "id", "name", "node_id", "url"]
```

---

## Milestone API Surface

### REST Endpoints

| Endpoint                                    | Method | Purpose          |
| ------------------------------------------- | ------ | ---------------- |
| `/repos/{owner}/{repo}/milestones`          | GET    | List milestones  |
| `/repos/{owner}/{repo}/milestones`          | POST   | Create milestone |
| `/repos/{owner}/{repo}/milestones/{number}` | GET    | Get milestone    |
| `/repos/{owner}/{repo}/milestones/{number}` | PATCH  | Update milestone |
| `/repos/{owner}/{repo}/milestones/{number}` | DELETE | Delete milestone |

### Milestone Fields

```json
[
  "closed_at",
  "closed_issues",
  "created_at",
  "creator",
  "description",
  "due_on",
  "html_url",
  "id",
  "labels_url",
  "node_id",
  "number",
  "open_issues",
  "state",
  "title",
  "updated_at",
  "url"
]
```

---

## Reaction API Surface

### Supported Content Types

- Issues
- Issue comments
- Pull request review comments
- Commit comments
- Releases

### Reaction Types

| Reaction   | Emoji | Available On        |
| ---------- | ----- | ------------------- |
| `+1`       | 👍    | All                 |
| `-1`       | 👎    | All except releases |
| `laugh`    | 😄    | All                 |
| `confused` | 😕    | All except releases |
| `heart`    | ❤️    | All                 |
| `hooray`   | 🎉    | All                 |
| `rocket`   | 🚀    | All                 |
| `eyes`     | 👀    | All                 |

### REST Endpoints

```
GET    /repos/{owner}/{repo}/issues/{number}/reactions
POST   /repos/{owner}/{repo}/issues/{number}/reactions
DELETE /repos/{owner}/{repo}/issues/{number}/reactions/{id}
```

---

## Notification API Surface

### REST Endpoints

| Endpoint                                   | Method         | Purpose                |
| ------------------------------------------ | -------------- | ---------------------- |
| `/notifications`                           | GET            | List all notifications |
| `/notifications`                           | PUT            | Mark all as read       |
| `/notifications/threads/{id}`              | GET            | Get thread             |
| `/notifications/threads/{id}`              | PATCH          | Mark thread as read    |
| `/notifications/threads/{id}`              | DELETE         | Mark as done           |
| `/notifications/threads/{id}/subscription` | GET/PUT/DELETE | Manage subscription    |
| `/repos/{owner}/{repo}/notifications`      | GET/PUT        | Repo notifications     |

### Query Parameters

- `all` - Include read notifications
- `participating` - Only direct participation
- `since` / `before` - Date filters
- `page` / `per_page` - Pagination

---

## Pull Request API Surface

### gh CLI Commands

| Command          | Purpose               |
| ---------------- | --------------------- |
| `gh pr list`     | List PRs              |
| `gh pr view`     | View PR               |
| `gh pr create`   | Create PR             |
| `gh pr edit`     | Edit PR               |
| `gh pr close`    | Close PR              |
| `gh pr reopen`   | Reopen PR             |
| `gh pr merge`    | Merge PR              |
| `gh pr checkout` | Check out locally     |
| `gh pr diff`     | View diff             |
| `gh pr checks`   | View CI status        |
| `gh pr review`   | Add review            |
| `gh pr comment`  | Add comment           |
| `gh pr ready`    | Mark ready for review |

### PR JSON Fields

```json
[
  "additions",
  "assignees",
  "author",
  "autoMergeRequest",
  "baseRefName",
  "body",
  "changedFiles",
  "closed",
  "closedAt",
  "comments",
  "commits",
  "createdAt",
  "deletions",
  "files",
  "headRefName",
  "headRefOid",
  "headRepository",
  "headRepositoryOwner",
  "id",
  "isCrossRepository",
  "isDraft",
  "labels",
  "latestReviews",
  "maintainerCanModify",
  "mergeCommit",
  "mergeStateStatus",
  "mergeable",
  "mergedAt",
  "mergedBy",
  "milestone",
  "number",
  "potentialMergeCommit",
  "projectCards",
  "projectItems",
  "reactionGroups",
  "reviewDecision",
  "reviewRequests",
  "reviews",
  "state",
  "statusCheckRollup",
  "title",
  "updatedAt",
  "url"
]
```

---

## GraphQL Object Reference

### Issue-Related

| Object          | Key Fields                                                         |
| --------------- | ------------------------------------------------------------------ |
| `Issue`         | title, body, state, author, assignees, labels, milestone, comments |
| `IssueComment`  | body, author, createdAt, reactions                                 |
| `IssueType`     | name, description                                                  |
| `IssueTemplate` | name, body, title                                                  |

### Project-Related

| Object           | Key Fields                                  |
| ---------------- | ------------------------------------------- |
| `ProjectV2`      | title, shortDescription, url, items, fields |
| `ProjectV2Item`  | content, fieldValues                        |
| `ProjectV2Field` | name, dataType                              |
| `ProjectV2View`  | name, layout, filter                        |

### Timeline Events

| Event                  | Trigger                       |
| ---------------------- | ----------------------------- |
| `AssignedEvent`        | Assignee added                |
| `UnassignedEvent`      | Assignee removed              |
| `LabeledEvent`         | Label added                   |
| `UnlabeledEvent`       | Label removed                 |
| `MilestonedEvent`      | Milestone set                 |
| `DemilestonedEvent`    | Milestone removed             |
| `ClosedEvent`          | Issue closed                  |
| `ReopenedEvent`        | Issue reopened                |
| `RenamedTitleEvent`    | Title changed                 |
| `CrossReferencedEvent` | Referenced from another issue |
| `CommentDeletedEvent`  | Comment deleted               |
| `LockedEvent`          | Conversation locked           |
| `UnlockedEvent`        | Conversation unlocked         |
| `PinnedEvent`          | Issue pinned                  |
| `UnpinnedEvent`        | Issue unpinned                |
| `TransferredEvent`     | Issue transferred             |

---

## gh status Command

Provides cross-repo overview:

- Assigned Issues
- Assigned Pull Requests
- Review Requests
- Mentions
- Repository Activity

```bash
gh status                    # All repos
gh status -o cli             # Specific org
gh status -e cli/cli         # Exclude repos
```

---

## Rate Limits

| API Type    | Limit                               |
| ----------- | ----------------------------------- |
| REST API    | 5,000 requests/hour (authenticated) |
| GraphQL API | 5,000 points/hour                   |
| Search API  | 30 requests/minute                  |

---

## Recommended Tool Additions

Based on this research, the MCP server should add:

### New Tools

1. **github_pr** - Pull request management
2. **github_label** - Label CRUD operations
3. **github_milestone** - Milestone management
4. **github_reaction** - Add/remove reactions
5. **github_notification** - Notification management
6. **github_search** - Advanced cross-repo search
7. **github_status** - Cross-repo activity overview

### Enhanced Capabilities

- Timeline event tracking
- Issue dependencies (blocking/blocked-by)
- Sub-issues (parent/child)
- Project field value updates via GraphQL
- Cross-repository queries
- Notification filtering

---

## Implementation Priority

### Phase 1 (Core)

- [x] github_issue
- [x] github_context
- [x] github_project
- [x] github_wiki
- [x] github_links

### Phase 2 (Extended)

- [x] github_pr
- [x] github_label
- [x] github_milestone
- [x] github_search (advanced)

### Phase 3 (Advanced)

- [x] github_notification
- [x] github_reaction
- [x] github_status (cross-repo)
- [x] GraphQL project field updates

### Phase 4 (Roadmap)

- [x] github_actions - Workflow management (#2)
- [ ] github_security - Code scanning, Dependabot alerts (#3)
- [ ] github_discussion - GitHub Discussions support (#4)
