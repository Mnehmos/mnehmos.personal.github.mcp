/**
 * GitHub Wiki tool implementation.
 * Persistent documentation and knowledge base.
 */
import { gh } from '../cli.js';
import { GithubWikiInputSchema } from '../schemas/wiki.js';
/**
 * Main wiki tool handler.
 *
 * Note: GitHub Wiki is a separate git repository.
 * Operations require cloning the wiki repo or using API.
 */
export async function handleWikiTool(input) {
    const parsed = GithubWikiInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            action: input.action,
            error: `Validation error: ${parsed.error.message}`,
        };
    }
    const { action, repo } = parsed.data;
    switch (action) {
        case 'list':
            return handleListWiki(parsed.data);
        case 'get':
            return handleGetPage(parsed.data);
        case 'create':
            return handleCreatePage(parsed.data);
        case 'update':
            return handleUpdatePage(parsed.data);
        case 'search':
            return handleSearchWiki(parsed.data);
        default:
            return {
                success: false,
                action,
                error: `Unknown action: ${action}`,
            };
    }
}
async function handleListWiki(input) {
    // GitHub API doesn't have direct wiki listing
    // Would need to clone wiki repo or use web scraping
    // Provide guidance instead
    const wikiUrl = `https://github.com/${input.repo}/wiki`;
    return {
        success: true,
        action: 'list',
        data: {
            url: wikiUrl,
            note: 'Wiki pages require git clone of wiki repo for programmatic listing.',
            command: `git clone https://github.com/${input.repo}.wiki.git`,
        },
        formatted: `\u{1F4DA} Wiki: ${wikiUrl}

To list pages programmatically:
  git clone https://github.com/${input.repo}.wiki.git
  ls *.md

Common pages to check:
  - Home
  - Architecture
  - API
  - Contributing`,
    };
}
async function handleGetPage(input) {
    if (!input.page) {
        return { success: false, action: 'get', error: 'Page name is required' };
    }
    // Use gh api to fetch wiki page content
    const pageSlug = input.page.replace(/ /g, '-');
    const result = await gh([
        'api',
        `repos/${input.repo}/contents/${pageSlug}.md`,
        '-H', 'Accept: application/vnd.github.raw',
        '--silent',
    ]);
    if (!result.success) {
        // Try wiki subdomain approach
        return {
            success: false,
            action: 'get',
            error: `Wiki page "${input.page}" not found. Wiki may need to be accessed via git clone.`,
            data: {
                url: `https://github.com/${input.repo}/wiki/${pageSlug}`,
                command: `git clone https://github.com/${input.repo}.wiki.git && cat ${pageSlug}.md`,
            },
        };
    }
    const page = {
        name: input.page,
        slug: pageSlug,
        content: result.data,
        lastModified: new Date().toISOString(),
        author: 'unknown',
    };
    return {
        success: true,
        action: 'get',
        data: page,
        formatted: `\u{1F4DA} Wiki: ${page.name}\n${'='.repeat(40)}\n\n${page.content}`,
    };
}
async function handleCreatePage(input) {
    if (!input.page || !input.content) {
        return { success: false, action: 'create', error: 'Page name and content are required' };
    }
    // Wiki pages are created via git commit to wiki repo
    const pageSlug = input.page.replace(/ /g, '-');
    const commitMessage = input.message || `Create ${input.page}`;
    return {
        success: true,
        action: 'create',
        data: {
            page: input.page,
            slug: pageSlug,
            url: `https://github.com/${input.repo}/wiki/${pageSlug}`,
        },
        formatted: `\u{1F4DD} To create wiki page "${input.page}":

1. Clone wiki repo:
   git clone https://github.com/${input.repo}.wiki.git
   cd ${input.repo.split('/')[1]}.wiki

2. Create page:
   cat > "${pageSlug}.md" << 'EOF'
${input.content}
EOF

3. Commit and push:
   git add "${pageSlug}.md"
   git commit -m "${commitMessage}"
   git push

Or create directly at:
  https://github.com/${input.repo}/wiki/${pageSlug}/_new`,
    };
}
async function handleUpdatePage(input) {
    if (!input.page || !input.content) {
        return { success: false, action: 'update', error: 'Page name and content are required' };
    }
    const pageSlug = input.page.replace(/ /g, '-');
    const commitMessage = input.message || `Update ${input.page}`;
    return {
        success: true,
        action: 'update',
        data: {
            page: input.page,
            slug: pageSlug,
            url: `https://github.com/${input.repo}/wiki/${pageSlug}`,
        },
        formatted: `\u{1F4DD} To update wiki page "${input.page}":

1. Clone wiki repo (if not already):
   git clone https://github.com/${input.repo}.wiki.git
   cd ${input.repo.split('/')[1]}.wiki

2. Update page:
   cat > "${pageSlug}.md" << 'EOF'
${input.content}
EOF

3. Commit and push:
   git add "${pageSlug}.md"
   git commit -m "${commitMessage}"
   git push

Or edit directly at:
  https://github.com/${input.repo}/wiki/${pageSlug}/_edit`,
    };
}
async function handleSearchWiki(input) {
    if (!input.query) {
        return { success: false, action: 'search', error: 'Search query is required' };
    }
    // GitHub search doesn't index wiki directly
    // Provide guidance for local search
    return {
        success: true,
        action: 'search',
        data: {
            query: input.query,
            url: `https://github.com/${input.repo}/wiki`,
        },
        formatted: `\u{1F50D} Wiki Search: "${input.query}"

GitHub doesn't index wiki in search API. To search:

1. Clone and grep:
   git clone https://github.com/${input.repo}.wiki.git
   cd ${input.repo.split('/')[1]}.wiki
   grep -r "${input.query}" *.md

2. Use GitHub web search (limited):
   https://github.com/${input.repo}/search?q=${encodeURIComponent(input.query)}&type=wikis

3. Browse wiki sidebar:
   https://github.com/${input.repo}/wiki`,
    };
}
//# sourceMappingURL=wiki.js.map