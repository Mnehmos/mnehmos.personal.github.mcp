/**
 * GitHub Reaction tool implementation.
 */
import { ghApi } from '../cli.js';
import { GithubReactionInputSchema } from '../schemas/reaction.js';
const REACTION_EMOJI = {
    '+1': '👍', '-1': '👎', 'laugh': '😄', 'confused': '😕',
    'heart': '❤️', 'hooray': '🎉', 'rocket': '🚀', 'eyes': '👀',
};
export async function handleReactionTool(input) {
    const parsed = GithubReactionInputSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false, action: input.action, error: `Validation error: ${parsed.error.message}` };
    }
    const { action } = parsed.data;
    switch (action) {
        case 'add': return handleAdd(parsed.data);
        case 'remove': return handleRemove(parsed.data);
        case 'list': return handleList(parsed.data);
        case 'get_summary': return handleGetSummary(parsed.data);
        default: return { success: false, action, error: `Unknown action: ${action}` };
    }
}
function parseRepo(repo) {
    const [owner, name] = repo.split('/');
    return { owner, name };
}
function getEndpoint(input, suffix = '') {
    const { owner, name } = parseRepo(input.repo);
    if (input.contentType === 'comment')
        return `/repos/${owner}/${name}/issues/comments/${input.commentId}/reactions${suffix}`;
    if (input.contentType === 'release')
        return `/repos/${owner}/${name}/releases/${input.releaseId}/reactions${suffix}`;
    return `/repos/${owner}/${name}/issues/${input.number}/reactions${suffix}`;
}
async function handleAdd(input) {
    if (!input.reaction)
        return { success: false, action: 'add', error: 'Reaction type is required' };
    const result = await ghApi.rest(getEndpoint(input), 'POST', { content: input.reaction });
    if (!result.success)
        return { success: false, action: 'add', error: result.error };
    return { success: true, action: 'add', data: result.data, formatted: `${REACTION_EMOJI[input.reaction]} Added reaction` };
}
async function handleRemove(input) {
    if (!input.reactionId)
        return { success: false, action: 'remove', error: 'Reaction ID is required' };
    const result = await ghApi.rest(getEndpoint(input, `/${input.reactionId}`), 'DELETE');
    if (!result.success)
        return { success: false, action: 'remove', error: result.error };
    return { success: true, action: 'remove', formatted: `✅ Removed reaction` };
}
async function handleList(input) {
    const result = await ghApi.rest(getEndpoint(input));
    if (!result.success)
        return { success: false, action: 'list', error: result.error };
    const reactions = result.data || [];
    const lines = reactions.length ? reactions.map(r => `${REACTION_EMOJI[r.content]} @${r.user.login}`) : ['No reactions'];
    return { success: true, action: 'list', data: reactions, formatted: lines.join('\n') };
}
async function handleGetSummary(input) {
    const result = await ghApi.rest(getEndpoint(input));
    if (!result.success)
        return { success: false, action: 'get_summary', error: result.error };
    const summary = {};
    (result.data || []).forEach(r => { summary[r.content] = (summary[r.content] || 0) + 1; });
    const parts = Object.entries(summary).map(([t, c]) => `${REACTION_EMOJI[t]} ${c}`).join(' ');
    return { success: true, action: 'get_summary', data: summary, formatted: parts || 'No reactions' };
}
//# sourceMappingURL=reaction.js.map