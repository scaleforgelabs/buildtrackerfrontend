import { api } from "@/libs/api";

// Types matching backend search response
export interface SearchResult {
    id: string;
    title: string;
    content: string;
    type: 'task' | 'wiki' | 'integration' | 'team' | 'quicklink' | 'log' | 'notification';
    workspace_id: string | null;
    workspace_name: string;
    created_at: string;
    updated_at: string;
    relevance_score: number;
    url: string;
}

export interface SearchPagination {
    page: number;
    page_size: number;
    total_pages: number;
    total_count: number;
}

export interface SearchCategories {
    tasks: number;
    wiki: number;
    integrations: number;
    team: number;
    quicklinks: number;
    logs: number;
    notifications: number;
}

export interface GlobalSearchResponse {
    results: SearchResult[];
    pagination: SearchPagination;
    categories: SearchCategories;
}

export interface WorkspaceSearchResponse {
    results: SearchResult[];
    pagination: SearchPagination;
    suggestions: string[];
}

export const SearchService = {
    globalSearch: async (query: string, page = 1, pageSize = 20): Promise<GlobalSearchResponse> => {
        const response = await api.get<GlobalSearchResponse>('/search/global', {
            params: { SearchKey: query, Page: page, PageSize: pageSize }
        });
        return response.data;
    },

    workspaceSearch: async (
        workspaceId: string,
        query: string,
        type?: string,
        page = 1,
        pageSize = 10
    ): Promise<WorkspaceSearchResponse> => {
        const response = await api.get<WorkspaceSearchResponse>(
            `/search/workspaces/${workspaceId}/search`,
            { params: { SearchKey: query, Type: type, Page: page, PageSize: pageSize } }
        );
        return response.data;
    },
};
