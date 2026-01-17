/**
 * Chat-friendly formatters for context reconstruction output.
 */
import type { ActiveContext } from "../schemas/context.js";
/**
 * Format full session context for agent consumption.
 */
export declare function formatActiveContext(ctx: ActiveContext): string;
/**
 * Format a compact context summary for injection into prompts.
 */
export declare function formatContextSummary(ctx: ActiveContext): string;
/**
 * Format blockers with urgency.
 */
export declare function formatBlockers(blockers: ActiveContext["blockers"]): string;
//# sourceMappingURL=context.d.ts.map