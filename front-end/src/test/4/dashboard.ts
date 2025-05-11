// src/types/dashboard.ts
export interface PerformanceSummary {
    projects: {
        count: number;
        percentage_change: number;
    };
    tasks: {
        count: number;
        percentage_change: number;
    };
    performance: {
        percentage: number;
        percentage_change: number;
    };
    deadlines_met: {
        percentage: number;
        percentage_change: number;
    };
    key_points: string[];
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
