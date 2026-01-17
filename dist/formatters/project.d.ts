/**
 * Chat-friendly formatters for GitHub Projects.
 * Kanban board visualization for terminal/chat display.
 */
import type { Project, ProjectColumn } from '../schemas/project.js';
/**
 * Format a project board as ASCII kanban.
 */
export declare function formatProjectBoard(project: Project, options?: {
    maxItemsPerColumn?: number;
    columnWidth?: number;
}): string;
/**
 * Format a single column view.
 */
export declare function formatProjectColumn(column: ProjectColumn, projectTitle: string): string;
/**
 * Format project list.
 */
export declare function formatProjectList(projects: Array<{
    number: number;
    title: string;
    url: string;
}>): string;
//# sourceMappingURL=project.d.ts.map