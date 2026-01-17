/**
 * GitHub Actions tool implementation.
 * Workflow management and CI/CD operations.
 */

import { gh } from '../cli.js';
import { GithubActionsInputSchema, type GithubActionsInput, type Workflow, type WorkflowRun, type Job } from '../schemas/actions.js';

export interface ActionsToolResult {
  success: boolean;
  action: string;
  data?: any;
  formatted?: string;
  error?: string;
}

export async function handleActionsTool(input: GithubActionsInput): Promise<ActionsToolResult> {
  const parsed = GithubActionsInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, action: input.action, error: `Validation error: ${parsed.error.message}` };
  }

  const { action } = parsed.data;

  switch (action) {
    case 'list_workflows': return handleListWorkflows(parsed.data);
    case 'list_runs': return handleListRuns(parsed.data);
    case 'get_run': return handleGetRun(parsed.data);
    case 'run': return handleRunWorkflow(parsed.data);
    case 'cancel': return handleCancel(parsed.data);
    case 'rerun': return handleRerun(parsed.data);
    case 'rerun_failed': return handleRerunFailed(parsed.data);
    case 'list_jobs': return handleListJobs(parsed.data);
    case 'get_logs': return handleGetLogs(parsed.data);
    default: return { success: false, action, error: `Unknown action: ${action}` };
  }
}

async function handleListWorkflows(input: GithubActionsInput): Promise<ActionsToolResult> {
  const result = await gh<{ workflows: Workflow[] }>([
    'api', `/repos/${input.repo}/actions/workflows`,
    '--jq', '.workflows | map({id, name, path, state})'
  ]);

  if (!result.success) return { success: false, action: 'list_workflows', error: result.error };

  const workflows = result.data || [];
  const lines = ['🔄 Workflows', '─'.repeat(50)];
  
  if (Array.isArray(workflows)) {
    workflows.forEach((w: any) => {
      const state = w.state === 'active' ? '✅' : '⚪';
      lines.push(`  ${state} ${w.name} (${w.path})`);
    });
  }

  return { success: true, action: 'list_workflows', data: workflows, formatted: lines.join('\n') };
}

async function handleListRuns(input: GithubActionsInput): Promise<ActionsToolResult> {
  const args = ['run', 'list', '-R', input.repo, '--json', 'databaseId,displayTitle,headBranch,status,conclusion,event,createdAt'];
  
  if (input.workflow) args.push('-w', input.workflow);
  if (input.branch) args.push('-b', input.branch);
  if (input.status) args.push('-s', input.status);
  if (input.limit) args.push('-L', String(input.limit));

  const result = await gh<WorkflowRun[]>(args);
  if (!result.success) return { success: false, action: 'list_runs', error: result.error };

  const runs = result.data || [];
  const lines = ['🏃 Workflow Runs', '─'.repeat(60)];

  runs.forEach((r: any) => {
    const status = r.conclusion === 'success' ? '✅' : 
                   r.conclusion === 'failure' ? '❌' : 
                   r.status === 'in_progress' ? '🔄' : '⏳';
    const title = (r.displayTitle || 'Run').slice(0, 40);
    lines.push(`  ${status} #${r.databaseId} ${title} [${r.headBranch}]`);
  });

  lines.push('─'.repeat(60));
  lines.push(`Total: ${runs.length} runs`);

  return { success: true, action: 'list_runs', data: runs, formatted: lines.join('\n') };
}

async function handleGetRun(input: GithubActionsInput): Promise<ActionsToolResult> {
  if (!input.runId) return { success: false, action: 'get_run', error: 'runId is required' };

  const result = await gh<WorkflowRun>([
    'run', 'view', String(input.runId), '-R', input.repo,
    '--json', 'databaseId,displayTitle,headBranch,headSha,status,conclusion,event,createdAt,updatedAt,jobs'
  ]);

  if (!result.success) return { success: false, action: 'get_run', error: result.error };

  const run = result.data as any;
  const status = run.conclusion === 'success' ? '✅' : 
                 run.conclusion === 'failure' ? '❌' : 
                 run.status === 'in_progress' ? '🔄' : '⏳';

  const lines = [
    `${status} Run #${run.databaseId}`,
    `  Title: ${run.displayTitle}`,
    `  Branch: ${run.headBranch}`,
    `  Status: ${run.status} ${run.conclusion ? `(${run.conclusion})` : ''}`,
    `  Event: ${run.event}`,
    `  Created: ${run.createdAt}`,
  ];

  if (run.jobs?.length) {
    lines.push('', '  Jobs:');
    run.jobs.forEach((j: any) => {
      const jStatus = j.conclusion === 'success' ? '✅' : j.conclusion === 'failure' ? '❌' : '🔄';
      lines.push(`    ${jStatus} ${j.name}`);
    });
  }

  return { success: true, action: 'get_run', data: run, formatted: lines.join('\n') };
}

async function handleRunWorkflow(input: GithubActionsInput): Promise<ActionsToolResult> {
  if (!input.workflow) return { success: false, action: 'run', error: 'workflow is required' };

  const args = ['workflow', 'run', input.workflow, '-R', input.repo];
  if (input.ref) args.push('--ref', input.ref);
  if (input.inputs) {
    Object.entries(input.inputs).forEach(([key, value]) => {
      args.push('-f', `${key}=${value}`);
    });
  }

  const result = await gh<string>(args);
  if (!result.success) return { success: false, action: 'run', error: result.error };

  return {
    success: true,
    action: 'run',
    formatted: `✅ Triggered workflow "${input.workflow}"${input.ref ? ` on ${input.ref}` : ''}`,
  };
}

async function handleCancel(input: GithubActionsInput): Promise<ActionsToolResult> {
  if (!input.runId) return { success: false, action: 'cancel', error: 'runId is required' };

  const result = await gh<string>(['run', 'cancel', String(input.runId), '-R', input.repo]);
  if (!result.success) return { success: false, action: 'cancel', error: result.error };

  return { success: true, action: 'cancel', formatted: `✅ Cancelled run #${input.runId}` };
}

async function handleRerun(input: GithubActionsInput): Promise<ActionsToolResult> {
  if (!input.runId) return { success: false, action: 'rerun', error: 'runId is required' };

  const result = await gh<string>(['run', 'rerun', String(input.runId), '-R', input.repo]);
  if (!result.success) return { success: false, action: 'rerun', error: result.error };

  return { success: true, action: 'rerun', formatted: `✅ Rerunning run #${input.runId}` };
}

async function handleRerunFailed(input: GithubActionsInput): Promise<ActionsToolResult> {
  if (!input.runId) return { success: false, action: 'rerun_failed', error: 'runId is required' };

  const result = await gh<string>(['run', 'rerun', String(input.runId), '-R', input.repo, '--failed']);
  if (!result.success) return { success: false, action: 'rerun_failed', error: result.error };

  return { success: true, action: 'rerun_failed', formatted: `✅ Rerunning failed jobs in run #${input.runId}` };
}

async function handleListJobs(input: GithubActionsInput): Promise<ActionsToolResult> {
  if (!input.runId) return { success: false, action: 'list_jobs', error: 'runId is required' };

  const result = await gh<{ jobs: Job[] }>([
    'api', `/repos/${input.repo}/actions/runs/${input.runId}/jobs`,
    '--jq', '.jobs | map({id, name, status, conclusion, started_at, completed_at})'
  ]);

  if (!result.success) return { success: false, action: 'list_jobs', error: result.error };

  const jobs = result.data || [];
  const lines = [`📋 Jobs for Run #${input.runId}`, '─'.repeat(50)];

  if (Array.isArray(jobs)) {
    jobs.forEach((j: any) => {
      const status = j.conclusion === 'success' ? '✅' : j.conclusion === 'failure' ? '❌' : '🔄';
      lines.push(`  ${status} ${j.name} (${j.status})`);
    });
  }

  return { success: true, action: 'list_jobs', data: jobs, formatted: lines.join('\n') };
}

async function handleGetLogs(input: GithubActionsInput): Promise<ActionsToolResult> {
  if (!input.runId && !input.jobId) {
    return { success: false, action: 'get_logs', error: 'runId or jobId is required' };
  }

  // Use gh run view --log for run logs
  const args = ['run', 'view', String(input.runId || input.jobId), '-R', input.repo, '--log'];
  if (input.jobId) args.push('--job', String(input.jobId));

  const result = await gh<string>(args);
  if (!result.success) return { success: false, action: 'get_logs', error: result.error };

  // Truncate logs to tail lines
  let logs = String(result.data || '');
  const lines = logs.split('\n');
  const tailLines = input.tailLines || 100;
  
  if (lines.length > tailLines) {
    logs = `... (${lines.length - tailLines} lines truncated)\n` + lines.slice(-tailLines).join('\n');
  }

  return {
    success: true,
    action: 'get_logs',
    data: logs,
    formatted: `📜 Logs (last ${tailLines} lines)\n${'─'.repeat(50)}\n${logs}`,
  };
}
