import api from './index';
import { authService } from './auth';

// Tasks Services
export const tasksService = {
  getTasks: () =>
    api.get('/tasks/'),

  getTask: (id: string) =>
    api.get(`/tasks/${id}/`),

  createTask: (data: any) =>
    api.post('/tasks/', data),

  updateTask: (id: string, data: any) =>
    api.put(`/tasks/${id}/`, data),

  deleteTask: (id: string) =>
    api.delete(`/tasks/${id}/`),

  getTaskComments: (id: string) =>
    api.get(`/tasks/${id}/comments/`),

  addTaskComment: (id: string, data: any) =>
    api.post(`/tasks/${id}/comments/`, data),

  getTasksByWorkspace: (workspaceId: string, params?: any) =>
    api.get(`/tasks/${workspaceId}/tasks/`, { params }),
};

// Personal Tasks Services
export const personalTasksService = {
  getTasks: () =>
    api.get('/tasks/personal-tasks/'),

  createTask: (data: { title: string; deadline?: string }) =>
    api.post('/tasks/personal-tasks/', data),

  updateTask: (id: string, data: { title?: string; deadline?: string; completed?: boolean }) =>
    api.patch(`/tasks/personal-tasks/${id}/`, data),

  deleteTask: (id: string) =>
    api.delete(`/tasks/personal-tasks/${id}/`),

  clearAll: () =>
    api.delete('/tasks/personal-tasks/clear_all/'),
};

// Workspaces Services
export const workspacesService = {
  getWorkspaces: (params?: {
    SearchKey?: string;
    DateFrom?: string;
    DateTo?: string;
    SortColumn?: string;
    SortOrder?: string;
    Status?: string;
    Page?: number;
    PageSize?: number;
  }) =>
    api.get('/workspaces/', { params }),

  getallworkspace: () =>
    api.get('/workspaces/'),

  getWorkspace: (id: string, params?: any) =>
    api.get(`/workspaces/${id}/`, { params }),

  createWorkspace: (data: {
    name: string;
    description?: string;
    type: 'Construction' | 'Software' | 'Event' | 'Other';
  }) =>
    api.post('/workspaces/', data),

  updateWorkspace: (id: string, data: any) =>
    api.put(`/workspaces/${id}/`, data),

  deleteWorkspace: (id: string) =>
    api.delete(`/workspaces/${id}/`),

  getMembers: (id: string, params?: any) =>
    api.get(`/workspaces/${id}/members/`, { params }),

  addMember: (id: string, data: any) =>
    api.post(`/workspaces/${id}/members/`, data),

  updateMember: (workspaceId: string, userId: string, data: any) =>
    api.put(`/workspaces/${workspaceId}/members/${userId}/`, data),

  removeMember: (workspaceId: string, userId: string) =>
    api.delete(`/workspaces/${workspaceId}/members/${userId}/`),

  getInvitations: (id: string, params?: any) =>
    api.get(`/workspaces/${id}/invitations/`, { params }),

  sendInvitation: (id: string, data: {
    email: string;
    role: 'Admin' | 'Member';
    phone?: string;
    job_role?: string;
  }) =>
    api.post(`/workspaces/${id}/invitations/`, data),

  acceptInvitation: (token: string) =>
    api.post('/workspaces/invitations/accept/', { token }),

  getInvitationDetails: (token: string) =>
    api.get(`/workspaces/invitations/${token}/details/`),

  getSettings: (id: string) =>
    api.get(`/workspaces/${id}/settings`),

  updateSettings: (id: string, data: any) =>
    api.put(`/workspaces/${id}/settings`, data),
};

// Wiki Services
// Subscriptions Services
export const subscriptionsService = {
  getPlans: () =>
    api.get('/subscriptions/plans/'),

  getDetails: (organizationId: string) =>
    api.get(`/subscriptions/details/${organizationId}/`),

  initiate: (organizationId: string, data: { plan_type: string, payment_provider: string, currency?: string, callback_url?: string, billing_cycle?: string }) =>
    api.post(`/subscriptions/initiate/${organizationId}/`, data),

  verifyPayment: (data: { reference: string, provider: string, transaction_id?: string }) =>
    api.post('/subscriptions/verify/', data),

  cancelSubscription: (organizationId: string) =>
    api.post(`/subscriptions/cancel/${organizationId}/`),

  downgradeSubscription: (organizationId: string, data: { plan_type: string }) =>
    api.post(`/subscriptions/downgrade/${organizationId}/`, data),
};

// Wiki Services
export const wikiService = {
  getDocuments: (workspaceId: string, params?: any) =>
    api.get(`/wiki/${workspaceId}/wiki/documents/`, { params }),

  getDocument: (workspaceId: string, id: string) =>
    api.get(`/wiki/${workspaceId}/wiki/documents/${id}/`),

  createDocument: (workspaceId: string, data: any) => {
    const isFormData = data instanceof FormData;
    return api.post(`/wiki/${workspaceId}/wiki/documents/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  updateDocument: (workspaceId: string, id: string, data: any) =>
    api.put(`/wiki/${workspaceId}/wiki/documents/${id}/`, data),

  deleteDocument: (workspaceId: string, id: string) =>
    api.delete(`/wiki/${workspaceId}/wiki/documents/${id}/`),

  search: (workspaceId: string, params?: any) =>
    api.get(`/wiki/${workspaceId}/wiki/search/`, { params }),
};

// Integrations Services
export const integrationsService = {
  getIntegrations: () =>
    api.get('/integrations/'),

  getIntegration: (id: string) =>
    api.get(`/integrations/${id}/`),

  createIntegration: (data: any) =>
    api.post('/integrations/', data),

  updateIntegration: (id: string, data: any) =>
    api.put(`/integrations/${id}/`, data),

  deleteIntegration: (id: string) =>
    api.delete(`/integrations/${id}/`),
};

// Files Services
export const filesService = {
  uploadFile: (workspaceId: string, file: File, folderId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folder', folderId);
    }
    return api.post(`/files/workspaces/${workspaceId}/files/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadFileToFolder: (workspaceId: string, folderId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/files/workspaces/${workspaceId}/folders/${folderId}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getFiles: () =>
    api.get('/files/'),

  getFile: (id: string) =>
    api.get(`/files/files/${id}/`),

  deleteFile: (id: string) =>
    api.delete(`/files/files/${id}/delete/`),

  getFolders: (workspaceId: string) =>
    api.get(`/files/workspaces/${workspaceId}/folders/`),

  getFolderContents: (workspaceId: string, folderId?: string) =>
    folderId
      ? api.get(`/files/workspaces/${workspaceId}/folders/${folderId}/`)
      : api.get(`/files/workspaces/${workspaceId}/folders/`),

  createFolder: (workspaceId: string, data: any) =>
    api.post(`/files/workspaces/${workspaceId}/folders/create/`, data),

  deleteFolder: (workspaceId: string, folderId: string) =>
    api.delete(`/files/workspaces/${workspaceId}/folders/${folderId}/delete/`),

  renameFolder: (workspaceId: string, folderId: string, data: any) =>
    api.put(`/files/workspaces/${workspaceId}/folders/${folderId}/`, data),

  getWorkspaceFiles: (workspaceId: string, params?: any) =>
    api.get(`/files/workspaces/${workspaceId}/files/`, { params }),

  renameFile: (fileId: string, data: any) =>
    api.put(`/files/files/${fileId}/`, data),

  downloadFile: (fileId: string) =>
    api.get(`/files/files/${fileId}/download/`),

  downloadFolder: (workspaceId: string, folderId: string) =>
    api.get(`/files/workspaces/${workspaceId}/folders/${folderId}/download/`),
};

// Quick Links Services
export const quickLinksService = {
  getUserQuickLinks: (userId: string | number, params?: any) =>
    api.get(`/quicklinks/users/${userId}/quick-links/`, { params }),

  getSharedQuickLinks: (workspaceId: string, params?: any) =>
    api.get(`/quicklinks/workspaces/${workspaceId}/quick-links/shared/`, { params }),

  createSharedQuickLink: (workspaceId: string, data: any) =>
    api.post(`/quicklinks/workspaces/${workspaceId}/quick-links/shared/`, data),

  createQuickLink: (userId: string | number, data: any) =>
    api.post(`/quicklinks/users/${userId}/quick-links/`, data),

  updateQuickLink: (userId: string | number, id: string, data: any) =>
    api.put(`/quicklinks/users/${userId}/quick-links/${id}/`, data),

  deleteQuickLink: (userId: string | number, id: string) =>
    api.delete(`/quicklinks/users/${userId}/quick-links/${id}/`),

  updateSharedQuickLink: (workspaceId: string, id: string, data: any) =>
    api.put(`/quicklinks/workspaces/${workspaceId}/quick-links/shared/${id}/`, data),

  deleteSharedQuickLink: (workspaceId: string, id: string) =>
    api.delete(`/quicklinks/workspaces/${workspaceId}/quick-links/shared/${id}/`),

  reorderQuickLinks: (userId: string | number, data: any) =>
    api.post(`/quicklinks/users/${userId}/quick-links/reorder/`, data),
};

// Search Services
export const searchService = {
  search: (query: string, filters?: any) =>
    api.get('/search/', { params: { q: query, ...filters } }),

  searchTasks: (query: string) =>
    api.get('/search/tasks/', { params: { q: query } }),

  searchDocuments: (query: string) =>
    api.get('/search/wiki/', { params: { q: query } }),
};

// Reports Services
export const reportsService = {
  getReports: () =>
    api.get('/reports/'),

  generateReport: (data: any) =>
    api.post('/reports/', data),

  getReport: (id: string) =>
    api.get(`/reports/${id}/`),

  downloadReport: (id: string) =>
    api.get(`/reports/${id}/download/`, { responseType: 'blob' }),
};

// Notifications Services
export const notificationsService = {
  getNotifications: (filters?: {
    Status?: 'read' | 'unread';
    Severity?: 'info' | 'success' | 'warning' | 'error';
    SearchKey?: string;
    DateFrom?: string;
    Page?: number;
    PageSize?: number;
    SortColumn?: string;
    SortOrder?: 'asc' | 'desc';
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return api.get(`/notifications?${params.toString()}`);
  },

  getWorkspaceNotifications: (workspaceId: string, filters?: {
    Status?: 'read' | 'unread';
    Severity?: 'info' | 'success' | 'warning' | 'error';
    SearchKey?: string;
    DateFrom?: string;
    Page?: number;
    PageSize?: number;
    SortColumn?: string;
    SortOrder?: 'asc' | 'desc';
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return api.get(`/workspaces/${workspaceId}/notifications?${params.toString()}`);
  },

  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put('/notifications/mark-all-read'),

  deleteNotification: (id: string) =>
    api.delete(`/notifications/${id}`),

  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
};

// Analytics Services
export const analyticsService = {
  getDashboardData: () =>
    api.get('/analytics/dashboard/'),

  getTaskAnalytics: () =>
    api.get('/analytics/tasks/'),

  getWorkspaceAnalytics: (id: string) =>
    api.get(`/analytics/workspaces/${id}/`),

  getUserActivity: () =>
    api.get('/analytics/user-activity/'),
};

// Monitoring Services
export const monitoringService = {
  getSystemHealth: () =>
    api.get('/monitoring/health/'),

  getMetrics: () =>
    api.get('/monitoring/metrics/'),

  getLogs: (filters?: any) =>
    api.get('/logs/', { params: filters }),
};

// Users Services
export const usersService = {
  getUser: (id: string) =>
    api.get(`/users/${id}/`),
};

// Organizations Services
export const organizationsService = {
  getOrganizations: () =>
    api.get('/organizations/'),

  getOrganization: (id: string) =>
    api.get(`/organizations/${id}/`),

  updateOrganization: (id: string, data: any) =>
    api.put(`/organizations/${id}/`, data),

  inviteUser: (data: any) =>
    api.post('/organizations/invite/', data),

  getMembers: () =>
    api.get('/organizations/members/'),

  removeMember: (id: string) =>
    api.delete(`/organizations/members/${id}/`),
};

// Core Services
export const coreService = {
  healthCheck: () =>
    api.get('/health/'),

  getVersion: () =>
    api.get('/version/'),
};

// Export all services as a single object
export default {
  auth: authService,
  tasks: tasksService,
  workspaces: workspacesService,
  wiki: wikiService,
  integrations: integrationsService,
  files: filesService,
  quickLinks: quickLinksService,
  search: searchService,
  reports: reportsService,
  notifications: notificationsService,
  analytics: analyticsService,
  monitoring: monitoringService,
  organizations: organizationsService,
  core: coreService,
};
