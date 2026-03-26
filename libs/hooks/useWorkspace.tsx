"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { workspacesService } from '@/libs/api/services';
import { useAuth } from './useAuth';

interface Workspace {
  id: string;
  name: string;
  description: string;
  type: string;
  owner: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  created_at: string;
  updated_at: string;
  no_of_tickets: number;
  member_count: number;
  user_role: string;
}

export interface WorkspaceSettings {
  timezone: string;
  date_format: string;
  notifications_enabled: boolean;
  auto_assign_tasks: boolean;
  default_task_priority: string;
  enabled_modules: {
    planning: boolean;
    my_tasks: boolean;
    logs: boolean;
  };
  updated_at: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  workspaceSettings: WorkspaceSettings | null;
  setWorkspaceSettings: (settings: WorkspaceSettings) => void;
  loading: boolean;
  error: string | null;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (data: { name: string; description?: string; type: "Construction" | "Software" | "Event" | "Other" }) => Promise<Workspace>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  switchWorkspace: (workspace: Workspace) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchWorkspaces = async () => {
    if (!mounted || !isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const response = await workspacesService.getWorkspaces({ _t: Date.now() } as any);
      const fetchedWorkspaces = response.data.results.data;
      setWorkspaces(fetchedWorkspaces);

      const workspaceId = params?.id as string;
      if (workspaceId) {
        const workspace = fetchedWorkspaces.find((ws: Workspace) => ws.id === workspaceId);
        if (workspace) {
          setCurrentWorkspace(workspace);
          localStorage.setItem('lastWorkspaceId', workspace.id);
        } else {
          // If workspace ID in URL doesn't exist, redirect to first workspace
          if (fetchedWorkspaces.length > 0) {
            const firstWorkspace = fetchedWorkspaces[0];
            const pathParts = pathname.split('/');
            const currentPage = pathParts[pathParts.length - 1] || 'home';
            router.replace(`/${firstWorkspace.id}/${currentPage}`);
          }
        }
      } else {
        // No workspace ID in URL, prioritize backend last_active_workspace
        const lastWorkspaceId = user?.last_active_workspace || localStorage.getItem('lastWorkspaceId');

        if (lastWorkspaceId) {
          const workspace = fetchedWorkspaces.find((ws: Workspace) => ws.id === lastWorkspaceId);
          if (workspace) {
            setCurrentWorkspace(workspace);
          }
        }

        if (fetchedWorkspaces.length > 0 && (pathname === '/dashboard' || pathname === '/')) {
          const lastId = user?.last_active_workspace || localStorage.getItem('lastWorkspaceId');
          const workspaceToRedirect = fetchedWorkspaces.find((ws: Workspace) => ws.id === lastId) || fetchedWorkspaces[0];
          router.replace(`/${workspaceToRedirect.id}/home`);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch workspaces:', err);
      setError(err.response?.data?.error || 'Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (data: { name: string; description?: string; type: "Construction" | "Software" | "Event" | "Other" }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await workspacesService.createWorkspace(data);
      const newWorkspace = response.data.workspace;
      setWorkspaces(prev => [newWorkspace, ...prev]);
      setCurrentWorkspace(newWorkspace);
      return newWorkspace;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create workspace');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchWorkspaces();
    }
  }, [mounted, isAuthenticated]);

  // Fetch settings and sync last_active_workspace when currentWorkspace changes
  useEffect(() => {
    let isMounted = true;
    const syncWorkspaceAndFetchSettings = async () => {
      if (!currentWorkspace) {
        setWorkspaceSettings(null);
        return;
      }

      // Sync with backend if different
      if (isAuthenticated && user && user.last_active_workspace !== currentWorkspace.id) {
        try {
          // Import authService dynamically to avoid circular dependency if any, 
          // although hooks are usually fine.
          const { authService } = await import('@/libs/api/auth');
          await authService.updateProfile({ last_active_workspace: currentWorkspace.id });
        } catch (err) {
          console.error('Failed to sync last workspace:', err);
        }
      }

      try {
        const response = await workspacesService.getSettings(currentWorkspace.id);
        if (isMounted) {
          setWorkspaceSettings(response.data.settings);
        }
      } catch (err) {
        console.error('Failed to fetch workspace settings:', err);
      }
    };

    syncWorkspaceAndFetchSettings();
    return () => { isMounted = false; };
  }, [currentWorkspace, isAuthenticated]);

  const switchWorkspace = (workspace: Workspace) => {
    if (!mounted) return;
    setCurrentWorkspace(workspace);
    const pathParts = pathname.split('/');
    const currentPage = pathParts[pathParts.length - 1] || 'home';
    router.push(`/${workspace.id}/${currentPage}`);
  };

  const value = {
    workspaces,
    currentWorkspace,
    workspaceSettings,
    setWorkspaceSettings,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
    setCurrentWorkspace,
    switchWorkspace,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}