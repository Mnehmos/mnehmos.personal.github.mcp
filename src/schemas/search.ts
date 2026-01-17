import { z } from 'zod';

// Search result types
export const SearchIssueSchema = z.object({
  number: z.number(),
  title: z.string(),
  state: z.string(),
  url: z.string(),
  repository: z.object({
    nameWithOwner: z.string(),
  }),
  author: z.object({ login: z.string() }).optional(),
  labels: z.array(z.object({ name: z.string() })).optional().default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  commentsCount: z.number().optional(),
});

export const SearchRepoSchema = z.object({
  name: z.string(),
  fullName: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  stargazerCount: z.number(),
  forkCount: z.number(),
  language: z.string().nullable(),
  isPrivate: z.boolean(),
  updatedAt: z.string(),
});

export const SearchCodeSchema = z.object({
  path: z.string(),
  repository: z.object({
    nameWithOwner: z.string(),
  }),
  textMatches: z.array(z.object({
    fragment: z.string(),
  })).optional().default([]),
});

export const SearchCommitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  author: z.object({
    name: z.string(),
    email: z.string(),
    date: z.string(),
  }),
  repository: z.object({
    nameWithOwner: z.string(),
  }),
  url: z.string(),
});

// Tool input schema
export const GithubSearchInputSchema = z.object({
  action: z.enum([
    'issues', 'prs', 'repos', 'code', 'commits'
  ]).describe('Type of search to perform'),

  query: z.string().describe('Search query using GitHub search syntax'),

  // Filters
  repo: z.string().optional().describe('Limit to specific repo (owner/repo)'),
  owner: z.string().optional().describe('Limit to repos owned by user/org'),
  language: z.string().optional().describe('Filter by programming language'),
  
  // For issues/prs
  state: z.enum(['open', 'closed', 'all']).optional(),
  author: z.string().optional(),
  assignee: z.string().optional(),
  mentions: z.string().optional(),
  label: z.array(z.string()).optional(),
  
  // Date filters
  created: z.string().optional().describe('Created date filter (e.g., >2024-01-01)'),
  updated: z.string().optional().describe('Updated date filter'),
  
  // Sort and pagination
  sort: z.enum([
    'created', 'updated', 'comments', 'reactions',
    'stars', 'forks', 'best-match', 'author-date', 'committer-date'
  ]).optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.number().min(1).max(100).optional().default(30),
});

export type GithubSearchInput = z.infer<typeof GithubSearchInputSchema>;
