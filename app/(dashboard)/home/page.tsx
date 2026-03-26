"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { workspacesService } from "@/libs/api/services";
import CreateWorkspaceModal from "@/app/components/modals/CreateWorkspaceModal";

import { useAuth } from "@/libs/hooks/useAuth";

export default function DashboardHomeRedirect() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const redirectToWorkspace = async () => {
      try {
        const response = await workspacesService.getWorkspaces();
        const workspaces = response.data.results?.data || [];

        if (workspaces.length > 0) {
          const lastWorkspaceId = user?.last_active_workspace || localStorage.getItem('lastWorkspaceId');
          const workspaceToRedirect = workspaces.find((ws: any) => ws.id === lastWorkspaceId) || workspaces[0];
          router.replace(`/${workspaceToRedirect.id}/home`);
        } else {
          setLoading(false);
          setShowCreateModal(true);
        }
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
        router.replace('/login');
      }
    };

    redirectToWorkspace();
  }, [router, user]);

  const handleWorkspaceCreated = async () => {
    setShowCreateModal(false);
    setLoading(true);
    try {
      const response = await workspacesService.getWorkspaces();
      const workspaces = response.data.results?.data || [];
      if (workspaces.length > 0) {
        router.replace(`/${workspaces[0].id}/home`);
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">Loading workspace...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      {showCreateModal && (
        <CreateWorkspaceModal
          isOpen={true}
          onClose={handleWorkspaceCreated}
          required={true}
        />
      )}
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-4">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome to BuildTracker!</h1>
          <p className="text-muted-foreground mb-6">
            Create your first workspace to get started managing your projects.
          </p>
        </div>
      </div>
    </>
  );
}
