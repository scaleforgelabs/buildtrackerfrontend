import { api } from "@/libs/api";

export interface Integration {
    id: string;
    name: string;
    icon: string;
    url: string;
    category: string;
    description: string;
    created_at: string;
    is_visible: boolean;
}

export const IntegrationsService = {
    getIntegrations: async (workspaceId: string, params?: any) => {
        const response = await api.get<{ data: Integration[] }>(`/integrations/${workspaceId}/integrations/`, { params });
        return response.data;
    },

    addIntegration: async (workspaceId: string, data: any) => {
        const response = await api.post<{ integration: Integration }>(`/integrations/${workspaceId}/integrations/`, data);
        return response.data;
    },

    updateIntegration: async (workspaceId: string, id: string, data: any) => {
        const response = await api.put<{ integration: Integration }>(`/integrations/${workspaceId}/integrations/${id}/`, data);
        return response.data;
    },

    deleteIntegration: async (workspaceId: string, id: string) => {
        const response = await api.delete(`/integrations/${workspaceId}/integrations/${id}/`);
        return response.data;
    }
};
