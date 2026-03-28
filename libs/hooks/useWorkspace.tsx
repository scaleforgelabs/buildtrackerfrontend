"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  loading: boolean;
  error: string | null;
  fetchWorkspaces: () => void; // Keeping for compatibility, now a no-op or trigger
  createWorkspace: (data: any) => Promise<Workspace>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setWorkspaceSettings: (settings: WorkspaceSettings) => void;
  switchWorkspace: (workspace: Workspace) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  // 1. Fetch Workspaces via React Query
  const {
    data: workspaces = [],
    isLoading: loadingWorkspaces,
    error: workspacesError,
    refetch: fetchWorkspaces
  } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await workspacesService.getWorkspaces();
      return response.data.results.data as Workspace[];
    },
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // 2. Fetch Settings via React Query
  const {
    data: workspaceSettings = null,
    isLoading: loadingSettings,
  } = useQuery({
    queryKey: ['workspaceSettings', currentWorkspace?.id],
    queryFn: async () => {
      const wsId = currentWorkspace?.id;
      if (!wsId) return null;
      const response = await workspacesService.getSettings(wsId);
      return response.data.settings as WorkspaceSettings;
    },
    enabled: !!currentWorkspace?.id && !!isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // 3. Create Workspace Mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: (data: any) => workspacesService.createWorkspace(data),
    onSuccess: (response) => {
      const newWorkspace = response.data.workspace;
      queryClient.setQueryData(['workspaces'], (prev: Workspace[] | undefined) =>
        prev ? [newWorkspace, ...prev] : [newWorkspace]
      );
      setCurrentWorkspace(newWorkspace);
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    }
  });

  // 4. Initialization and URL Sync logic
  useEffect(() => {
    if (!isAuthenticated || workspaces.length === 0) return;

    const workspaceIdFromUrl = params?.id as string;

    if (workspaceIdFromUrl) {
      const found = workspaces.find(ws => ws.id === workspaceIdFromUrl);
      if (found) {
        if (currentWorkspace?.id !== found.id) {
          setCurrentWorkspace(found);
          localStorage.setItem('lastWorkspaceId', found.id);
        }
      } else {
        // Redirect if invalid ID
        const first = workspaces[0];
        const pathParts = pathname.split('/');
        if (pathParts.length > 2) {
          pathParts[1] = first.id;
          router.replace(pathParts.join('/'));
        } else {
          router.replace(`/${first.id}/home`);
        }
      }
    } else {
      // Default workspace selection
      const lastId = user?.last_active_workspace || localStorage.getItem('lastWorkspaceId');
      const target = workspaces.find(ws => ws.id === lastId) || workspaces[0];

      if (target && (pathname === '/dashboard' || pathname === '/' || pathname === '/home')) {
        router.replace(`/${target.id}/home`);
      }

      if (target && !currentWorkspace) {
        setCurrentWorkspace(target);
      }
    }
  }, [workspaces, params?.id, isAuthenticated]);

  // Sync last_active_workspace with backend
  useEffect(() => {
    if (isAuthenticated && user && currentWorkspace && user.last_active_workspace !== currentWorkspace.id) {
      import('@/libs/api/auth').then(({ authService }) => {
        authService.updateProfile({ last_active_workspace: currentWorkspace.id });
      }).catch(err => console.error('Failed to sync last workspace:', err));
    }
  }, [currentWorkspace, isAuthenticated, user]);

  const searchParams = useSearchParams();
  const pathnameRef = useRef(pathname);
  const searchParamsRef = useRef(searchParams);

  useEffect(() => {
    pathnameRef.current = pathname;
    searchParamsRef.current = searchParams;
  }, [pathname, searchParams]);

  const switchWorkspace = useCallback((workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    const currentPathname = pathnameRef.current;
    const currentSearchParams = searchParamsRef.current;

    const pathParts = currentPathname.split('/'); // ['', 'id', 'sub', 'path']
    const queryString = currentSearchParams.toString();
    const suffix = queryString ? `?${queryString}` : '';

    if (pathParts.length > 2) {
      pathParts[1] = workspace.id;
      router.push(pathParts.join('/') + suffix);
    } else {
      router.push(`/${workspace.id}/home${suffix}`);
    }
  }, [router]);

  const value = useMemo(() => ({
    workspaces,
    currentWorkspace,
    workspaceSettings,
    loading: loadingWorkspaces || loadingSettings,
    error: workspacesError ? (workspacesError as any).message : null,
    fetchWorkspaces: () => fetchWorkspaces(),
    createWorkspace: async (data: any) => {
      const res = await createWorkspaceMutation.mutateAsync(data);
      return res.data.workspace;
    },
    setCurrentWorkspace,
    setWorkspaceSettings: (settings: WorkspaceSettings) => {
      queryClient.setQueryData(['workspaceSettings', currentWorkspace?.id], settings);
    },
    switchWorkspace,
  }), [workspaces, currentWorkspace, workspaceSettings, loadingWorkspaces, loadingSettings, workspacesError, switchWorkspace, queryClient, createWorkspaceMutation, fetchWorkspaces]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}