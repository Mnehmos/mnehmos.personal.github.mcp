import { z } from 'zod';

// Reaction types available on GitHub
export const REACTION_TYPES = [
  '+1', '-1', 'laugh', 'confused', 'heart', 'hooray', 'rocket', 'eyes'
] as const;

export const ReactionTypeSchema = z.enum(REACTION_TYPES);
export type ReactionType = z.infer<typeof ReactionTypeSchema>;

// Reaction data
export const ReactionSchema = z.object({
  id: z.number(),
  content: ReactionTypeSchema,
  user: z.object({
    login: z.string(),
  }),
  createdAt: z.string(),
});

export type Reaction = z.infer<typeof ReactionSchema>;

// Reaction summary (from issue/PR)
export const ReactionGroupSchema = z.object({
  content: z.string(),
  users: z.object({
    totalCount: z.number(),
  }),
});

// Tool input schema
export const GithubReactionInputSchema = z.object({
  action: z.enum([
    'add', 'remove', 'list', 'get_summary'
  ]).describe('Action to perform'),

  repo: z.string().describe('Repository in owner/repo format'),

  // Target content type
  contentType: z.enum(['issue', 'pr', 'comment', 'release'])
    .describe('Type of content to react to'),

  // For issue/pr reactions
  number: z.number().optional().describe('Issue or PR number'),

  // For comment reactions
  commentId: z.number().optional().describe('Comment ID'),

  // For release reactions
  releaseId: z.number().optional().describe('Release ID'),

  // Reaction to add/remove
  reaction: ReactionTypeSchema.optional()
    .describe('Reaction type (+1, -1, laugh, confused, heart, hooray, rocket, eyes)'),

  // For remove - specific reaction ID
  reactionId: z.number().optional().describe('Specific reaction ID to remove'),
});

export type GithubReactionInput = z.infer<typeof GithubReactionInputSchema>;
