/**
 * GitHub Search tool implementation.
 * Advanced cross-repo search operations.
 */
import { gh } from '../cli.js';
import { GithubSearchInputSchema } from '../schemas/search.js';
const ISSUE_JSON_FIELDS = [
    'number', 'title', 'state', 'url', 'repository',
    'author', 'labels', 'createdAt', 'updatedAt', 'commentsCount'
].join(',');
const REPO_JSON_FIELDS = [
    'name', 'fullName', 'description', 'url',
    'stargazerCount', 'forkCount', 'language', 'isPrivate', 'updatedAt'
].join(',');
/**
 * Main search tool handler.
 */
export async function handleSearchTool(input) {
    const parsed = GithubSearchInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            action: input.action,
            error: `Validation error: ${parsed.error.message}`,
        };
    }
    const { action } = parsed.data;
    switch (action) {
        case 'issues':
            return handleSearchIssues(parsed.data);
        case 'prs':
            return handleSearchPrs(parsed.data);
        case 'repos':
            return handleSearchRepos(parsed.data);
        case 'code':
            return handleSearchCode(parsed.data);
        case 'commits':
            return handleSearchCommits(parsed.data);
        default:
            return { success: false, action, error: `Unknown action: ${action}` };
    }
}
function buildSearchQuery(input) {
    const parts = [input.query];
    if (input.repo)
        parts.push(`repo:${input.repo}`);
    if (input.owner)
        parts.push(`user:${input.owner}`);
    if (input.language)
        parts.push(`language:${input.language}`);
    if (input.state && input.state !== 'all')
        parts.push(`state:${input.state}`);
    if (input.author)
        parts.push(`author:${input.author}`);
    if (input.assignee)
        parts.push(`assignee:${input.assignee}`);
    if (input.mentions)
        parts.push(`mentions:${input.mentions}`);
    if (input.label?.length) {
        input.label.forEach(l => parts.push(`label:${l}`));
    }
    if (input.created)
        parts.push(`created:${input.created}`);
    if (input.updated)
        parts.push(`updated:${input.updated}`);
    return parts.join(' ');
}
async function handleSearchIssues(input) {
    const query = buildSearchQuery(input);
    const args = [
        'search', 'issues',
        '--json', ISSUE_JSON_FIELDS,
        '--limit', String(input.limit || 30),
    ];
    if (input.sort)
        args.push('--sort', input.sort);
    if (input.order)
        args.push('--order', input.order);
    args.push(query);
    const result = await gh(args);
    if (!result.success) {
        return { success: false, action: 'issues', error: result.error };
    }
    return {
        success: true,
        action: 'issues',
        data: result.data,
        formatted: formatIssueSearchResults(result.data || [], input.query),
    };
}
async function handleSearchPrs(input) {
    // Add type:pr to distinguish from issues
    const modifiedInput = { ...input, query: `${input.query} type:pr` };
    const query = buildSearchQuery(modifiedInput);
    const args = [
        'search', 'prs',
        '--json', ISSUE_JSON_FIELDS,
        '--limit', String(input.limit || 30),
    ];
    if (input.sort)
        args.push('--sort', input.sort);
    if (input.order)
        args.push('--order', input.order);
    args.push(query);
    const result = await gh(args);
    if (!result.success) {
        return { success: false, action: 'prs', error: result.error };
    }
    return {
        success: true,
        action: 'prs',
        data: result.data,
        formatted: formatPrSearchResults(result.data || [], input.query),
    };
}
async function handleSearchRepos(input) {
    const query = buildSearchQuery(input);
    const args = [
        'search', 'repos',
        '--json', REPO_JSON_FIELDS,
        '--limit', String(input.limit || 30),
    ];
    if (input.sort)
        args.push('--sort', input.sort);
    if (input.order)
        args.push('--order', input.order);
    args.push(query);
    const result = await gh(args);
    if (!result.success) {
        return { success: false, action: 'repos', error: result.error };
    }
    return {
        success: true,
        action: 'repos',
        data: result.data,
        formatted: formatRepoSearchResults(result.data || [], input.query),
    };
}
async function handleSearchCode(input) {
    const query = buildSearchQuery(input);
    const args = [
        'search', 'code',
        '--json', 'path,repository,textMatches',
        '--limit', String(input.limit || 30),
    ];
    args.push(query);
    const result = await gh(args);
    if (!result.success) {
        return { success: false, action: 'code', error: result.error };
    }
    return {
        success: true,
        action: 'code',
        data: result.data,
        formatted: formatCodeSearchResults(result.data || [], input.query),
    };
}
async function handleSearchCommits(input) {
    const query = buildSearchQuery(input);
    const args = [
        'search', 'commits',
        '--json', 'sha,message,author,repository,url',
        '--limit', String(input.limit || 30),
    ];
    if (input.sort)
        args.push('--sort', input.sort);
    if (input.order)
        args.push('--order', input.order);
    args.push(query);
    const result = await gh(args);
    if (!result.success) {
        return { success: false, action: 'commits', error: result.error };
    }
    return {
        success: true,
        action: 'commits',
        data: result.data,
        formatted: formatCommitSearchResults(result.data || [], input.query),
    };
}
// Formatters
function formatIssueSearchResults(issues, query) {
    if (issues.length === 0) {
        return `No issues found matching "${query}"`;
    }
    const lines = [
        `🔍 Issue Search: "${query}"`,
        `Found ${issues.length} issues`,
        '─'.repeat(70),
    ];
    issues.forEach((issue, idx) => {
        const state = issue.state === 'open' ? '🟢' : '🔴';
        const repo = issue.repository?.nameWithOwner || '';
        lines.push(`${idx + 1}. ${state} ${repo}#${issue.number} ${truncate(issue.title, 40)}`);
    });
    return lines.join('\n');
}
function formatPrSearchResults(prs, query) {
    if (prs.length === 0) {
        return `No PRs found matching "${query}"`;
    }
    const lines = [
        `🔍 PR Search: "${query}"`,
        `Found ${prs.length} pull requests`,
        '─'.repeat(70),
    ];
    prs.forEach((pr, idx) => {
        const state = pr.state === 'open' ? '🟢' : '🟣';
        const repo = pr.repository?.nameWithOwner || '';
        lines.push(`${idx + 1}. ${state} ${repo}#${pr.number} ${truncate(pr.title, 40)}`);
    });
    return lines.join('\n');
}
function formatRepoSearchResults(repos, query) {
    if (repos.length === 0) {
        return `No repositories found matching "${query}"`;
    }
    const lines = [
        `🔍 Repo Search: "${query}"`,
        `Found ${repos.length} repositories`,
        '─'.repeat(70),
    ];
    repos.forEach((repo, idx) => {
        const stars = repo.stargazerCount ? `⭐${repo.stargazerCount}` : '';
        const lang = repo.language ? `[${repo.language}]` : '';
        const priv = repo.isPrivate ? '🔒' : '';
        lines.push(`${idx + 1}. ${priv} ${repo.fullName} ${stars} ${lang}`);
        if (repo.description) {
            lines.push(`    ${truncate(repo.description, 60)}`);
        }
    });
    return lines.join('\n');
}
function formatCodeSearchResults(results, query) {
    if (results.length === 0) {
        return `No code found matching "${query}"`;
    }
    const lines = [
        `🔍 Code Search: "${query}"`,
        `Found ${results.length} results`,
        '─'.repeat(70),
    ];
    results.forEach((result, idx) => {
        const repo = result.repository?.nameWithOwner || '';
        lines.push(`${idx + 1}. ${repo}/${result.path}`);
        if (result.textMatches?.length) {
            lines.push(`    ...${truncate(result.textMatches[0].fragment, 60)}...`);
        }
    });
    return lines.join('\n');
}
function formatCommitSearchResults(commits, query) {
    if (commits.length === 0) {
        return `No commits found matching "${query}"`;
    }
    const lines = [
        `🔍 Commit Search: "${query}"`,
        `Found ${commits.length} commits`,
        '─'.repeat(70),
    ];
    commits.forEach((commit, idx) => {
        const repo = commit.repository?.nameWithOwner || '';
        const sha = commit.sha?.slice(0, 7) || '';
        const msg = commit.message?.split('\n')[0] || '';
        lines.push(`${idx + 1}. ${repo} ${sha} ${truncate(msg, 45)}`);
    });
    return lines.join('\n');
}
function truncate(str, max) {
    if (!str)
        return '';
    return str.length <= max ? str : str.slice(0, max - 3) + '...';
}
//# sourceMappingURL=search.js.map