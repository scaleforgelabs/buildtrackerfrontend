"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { workspacesService } from "@/libs/api/services";
import CreateWorkspaceModal from "@/app/components/modals/CreateWorkspaceModal";

import { useAuth } from "@/libs/hooks/useAuth";

export default function DashboardRedirect() {
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
          // No workspaces — show creation modal
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      {showCreateModal && (
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="text-center max-w-md mx-4">
            <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome to BuildTracker!</h1>
            <p className="text-muted-foreground mb-6">Create your first workspace to get started.</p>
          </div>
          <CreateWorkspaceModal
            isOpen={true}
            onClose={handleWorkspaceCreated}
            required={true}
          />
        </div>
      )}
    </>
  );
}