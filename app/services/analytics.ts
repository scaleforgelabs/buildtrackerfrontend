import { api } from "@/libs/api";

export interface DashboardStats {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    blockedTasks: number;
    totalMembers: number;
    velocity: number;
    healthScore: number;
    milestoneProgress: any[];
    sprintProgress: any[];
}

export interface DashboardCharts {
    statusData: { label: string; value: number }[];
    priorityData: { label: string; value: number }[];
    trendData: { date: string; label: string; value: number }[];
    memberPerformance: {
        member_name: string;
        member_email: string;
        member_avatar?: string;
        tasks_assigned: number;
        member_phone?: string;
        member_job_role?: string;
        member_role?: string;
        tasks_completed: number;
        tasks_pending: number;
        tasks_in_progress: number;
        tasks_overdue: number;
        avg_completion_time: number;
        efficiency_score: number;
    }[];
}

export interface PerformanceAnalytics {
    completionRate: number;
    averageTaskTime: number;
    teamEfficiency: number;
    bottlenecks: {
        area: string;
        severity: string;
        description: string;
        impact_score: number;
    }[];
    milestoneMetrics: any[];
    sprintMetrics: any[];
}

export const AnalyticsService = {
    getDashboardStats: async (workspaceId: string, params?: any) => {
        const response = await api.get<DashboardStats>(`/analytics/workspaces/${workspaceId}/dashboard/stats`, { params });
        return response.data;
    },

    getDashboardCharts: async (workspaceId: string, params?: any) => {
        const response = await api.get<DashboardCharts>(`/analytics/workspaces/${workspaceId}/dashboard/charts`, { params });
        return response.data;
    },

    getPerformanceAnalytics: async (workspaceId: string, params?: any) => {
        const response = await api.get<PerformanceAnalytics>(`/analytics/workspaces/${workspaceId}/analytics/performance`, { params });
        return response.data;
    }
};
