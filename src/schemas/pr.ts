import { z } from "zod";

// PR data returned from GitHub
export const PrSchema = z.object({
  number: z.number(),
  title: z.string(),
  body: z.string().nullable(),
  state: z.string(),
  url: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  closedAt: z.string().nullable().optional(),
  mergedAt: z.string().nullable().optional(),
  author: z.object({ login: z.string() }).optional(),
  assignees: z
    .array(z.object({ login: z.string() }))
    .optional()
    .default([]),
  labels: z
    .array(z.object({ name: z.string() }))
    .optional()
    .default([]),
  milestone: z
    .object({
      title: z.string(),
      number: z.number(),
    })
    .nullable()
    .optional(),
  headRefName: z.string().optional(),
  baseRefName: z.string().optional(),
  isDraft: z.boolean().optional(),
  mergeable: z.string().optional(),
  reviewDecision: z.string().nullable().optional(),
  additions: z.number().optional(),
  deletions: z.number().optional(),
  changedFiles: z.number().optional(),
  commits: z.array(z.any()).optional().default([]),
  reviews: z
    .array(
      z.object({
        author: z.object({ login: z.string() }),
        state: z.string(),
        body: z.string(),
      }),
    )
    .optional()
    .default([]),
  statusCheckRollup: z
    .array(
      z.object({
        name: z.string(),
        status: z.string(),
        conclusion: z.string().nullable(),
      }),
    )
    .optional()
    .default([]),
});

export type Pr = z.infer<typeof PrSchema>;

// Tool input schema
export const GithubPrInputSchema = z.object({
  action: z
    .enum([
      "list",
      "get",
      "create",
      "merge",
      "close",
      "reopen",
      "ready",
      "review",
      "diff",
      "checks",
      "comment",
    ])
    .describe("Action to perform"),

  repo: z.string().describe("Repository in owner/repo format"),

  // For get, merge, close, reopen, ready, review, diff, checks
  pr: z.coerce.number().optional().describe("Pull request number"),

  // For create
  title: z.string().optional().describe("PR title"),
  body: z.string().optional().describe("PR body (markdown)"),
  head: z.string().optional().describe("Branch with changes"),
  base: z.string().optional().describe("Branch to merge into (default: main)"),
  draft: z.boolean().optional().describe("Create as draft PR"),

  // For merge
  method: z.enum(["merge", "squash", "rebase"]).optional().default("merge"),
  deleteAfterMerge: z.boolean().optional().default(false),

  // For review
  event: z.enum(["approve", "comment", "request_changes"]).optional(),
  reviewBody: z.string().optional().describe("Review comment body"),

  // For comment
  comment: z.string().optional().describe("Comment body"),

  // For list
  state: z.enum(["open", "closed", "merged", "all"]).optional().default("open"),
  limit: z.coerce.number().min(1).max(100).optional().default(30),

  // Labels and assignees for create/update
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
  reviewers: z.array(z.string()).optional(),
});

export type GithubPrInput = z.infer<typeof GithubPrInputSchema>;
