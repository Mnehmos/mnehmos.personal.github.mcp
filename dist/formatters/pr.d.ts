/**
 * Chat-friendly formatters for Pull Requests.
 */
export interface PrJson {
    number: number;
    title: string;
    body?: string | null;
    state: string;
    url?: string;
    author?: {
        login: string;
    };
    headRefName?: string;
    baseRefName?: string;
    isDraft?: boolean;
    mergeable?: string;
    reviewDecision?: string | null;
    additions?: number;
    deletions?: number;
    changedFiles?: number;
    reviews?: Array<{
        author: {
            login: string;
        };
        state: string;
    }>;
    statusCheckRollup?: Array<{
        name: string;
        status: string;
        conclusion: string | null;
    }>;
    labels?: Array<{
        name: string;
    }>;
    assignees?: Array<{
        login: string;
    }>;
    updatedAt?: string;
}
export declare function formatPr(pr: PrJson): string;
export declare function formatPrList(prs: PrJson[]): string;
export declare function formatPrChecks(checks: Array<{
    name: string;
    state: string;
    description?: string;
}>, prNumber: number): string;
//# sourceMappingURL=pr.d.ts.map