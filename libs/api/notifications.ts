import { api } from './index';

export interface Notification {
  id: string;
  user: string;
  workspace: string;
  action: string;
  description: string;
  note_type: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface NotificationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    data: Notification[];
    pagination: {
      page: number;
      page_size: number;
      total_pages: number;
      total_count: number;
    };
    filters?: {
      status: string;
      severity: string;
      search_key: string;
      date_from: string;
      sort_column: string;
      sort_order: string;
    };
  };
}

export interface NotificationFilters {
  Status?: 'read' | 'unread';
  Severity?: 'info' | 'success' | 'warning' | 'error';
  SearchKey?: string;
  DateFrom?: string;
  Page?: number;
  PageSize?: number;
  SortColumn?: string;
  SortOrder?: 'asc' | 'desc';
}

export const notificationsApi = {
  // Get user notifications
  getNotifications: (filters?: NotificationFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return api.get<NotificationResponse>(`/notifications?${params.toString()}`);
  },

  // Get workspace notifications
  getWorkspaceNotifications: (workspaceId: string, filters?: NotificationFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return api.get<NotificationResponse>(`/workspaces/${workspaceId}/notifications?${params.toString()}`);
  },

  // Mark notification as read
  markAsRead: (id: string) => {
    return api.put(`/notifications/${id}/read`);
  },

  // Delete notification
  deleteNotification: (id: string) => {
    return api.delete(`/notifications/${id}`);
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    return api.put('/notifications/mark-all-read');
  },

  // Get unread count
  getUnreadCount: () => {
    return api.get<{ count: number }>('/notifications/unread-count');
  },
};