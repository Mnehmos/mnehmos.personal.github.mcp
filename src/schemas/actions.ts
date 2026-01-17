import { z } from 'zod';

// Workflow run data
export const WorkflowRunSchema = z.object({
  id: z.number(),
  name: z.string(),
  displayTitle: z.string().optional(),
  headBranch: z.string(),
  headSha: z.string(),
  status: z.string(),
  conclusion: z.string().nullable(),
  event: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  url: z.string(),
  actor: z.object({ login: z.string() }).optional(),
});

export type WorkflowRun = z.infer<typeof WorkflowRunSchema>;

// Workflow data
export const WorkflowSchema = z.object({
  id: z.number(),
  name: z.string(),
  path: z.string(),
  state: z.string(),
  url: z.string(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

// Job data
export const JobSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  conclusion: z.string().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  steps: z.array(z.object({
    name: z.string(),
    status: z.string(),
    conclusion: z.string().nullable(),
    number: z.number(),
  })).optional(),
});

export type Job = z.infer<typeof JobSchema>;

// Tool input schema
export const GithubActionsInputSchema = z.object({
  action: z.enum([
    'list_workflows',     // List all workflows in repo
    'list_runs',          // List workflow runs
    'get_run',            // Get specific run details
    'run',                // Trigger workflow dispatch
    'cancel',             // Cancel a running workflow
    'rerun',              // Rerun a workflow
    'rerun_failed',       // Rerun only failed jobs
    'list_jobs',          // List jobs in a run
    'get_logs',           // Get job/run logs
  ]).describe('Action to perform'),

  repo: z.string().describe('Repository in owner/repo format'),

  // For list_runs, get_run, cancel, rerun, list_jobs, get_logs
  runId: z.coerce.number().optional().describe('Workflow run ID'),

  // For run, list_runs
  workflow: z.string().optional().describe('Workflow ID or filename (e.g., ci.yml)'),

  // For run
  ref: z.string().optional().describe('Git ref to run workflow on (branch/tag)'),
  inputs: z.record(z.string()).optional().describe('Workflow dispatch inputs'),

  // For list_runs
  branch: z.string().optional().describe('Filter runs by branch'),
  status: z.enum(['queued', 'in_progress', 'completed', 'waiting', 'requested', 'pending'])
    .optional().describe('Filter runs by status'),
  event: z.string().optional().describe('Filter by event type (push, pull_request, etc)'),

  // For get_logs
  jobId: z.coerce.number().optional().describe('Specific job ID for logs'),
  tailLines: z.coerce.number().optional().default(100).describe('Number of log lines to return'),

  // Pagination
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export type GithubActionsInput = z.infer<typeof GithubActionsInputSchema>;
