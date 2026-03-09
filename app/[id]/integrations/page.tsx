'use client'

import { Plus } from "lucide-react";
import IntegrationCard from "@/app/components/integration/IntegrationCard"
import { Images } from "@/public";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { useEffect, useState } from "react";
import { IntegrationsService, Integration } from "@/app/services/integrations";
import AddIntegrationModal from "@/app/components/integration/AddIntegrationModal";
import { toast } from "sonner"; // Assuming sonner is used for notifications based on project patterns

// Define the integration type for the UI
type UIIntegration = {
  id?: string;
  name: string;
  category: string;
  categoryColor: "blue" | "purple" | "green" | "orange" | "red";
  description: string;
  icon: any;
  isActive: boolean;
};

export default function IntegrationsPage() {
  const { currentWorkspace } = useWorkspace();
  const [integrations, setIntegrations] = useState<UIIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIntegrations = async () => {
    if (!currentWorkspace?.id) return;

    try {
      setLoading(true);
      const response = await IntegrationsService.getIntegrations(currentWorkspace.id, { _t: Date.now() });
      const activeIntegrationsVal = Array.isArray(response) ? response : (response.data || []);

      const mappedIntegrations = activeIntegrationsVal.map((active: any) => ({
        id: active.id,
        name: active.name,
        category: active.category || "General",
        categoryColor: mapCategoryToColor(active.category),
        description: active.description || "No description provided",
        icon: (active.icon && active.icon.startsWith('http')) ? active.icon : Images.logo,
        isActive: active.is_visible,
      }));

      setIntegrations(mappedIntegrations);
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
      toast.error("Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  const mapCategoryToColor = (category: string): "blue" | "purple" | "green" | "orange" | "red" => {
    const map: Record<string, "blue" | "purple" | "green" | "orange" | "red"> = {
      "Communication": "blue",
      "Security": "purple",
      "Storage": "green",
      "Productivity": "orange",
      "Development": "red",
    };
    return map[category] || "blue";
  };

  useEffect(() => {
    fetchIntegrations();
  }, [currentWorkspace?.id]);

  const handleAddIntegration = async (data: any) => {
    if (!currentWorkspace?.id) return;
    try {
      await IntegrationsService.addIntegration(currentWorkspace.id, data);
      toast.success("Integration added successfully");
      fetchIntegrations();
    } catch (error) {
      console.error("Add integration failed:", error);
      toast.error("Failed to add integration");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!currentWorkspace?.id) return;
    const newStatus = !currentStatus;

    // Optimistic update
    setIntegrations(prev => prev.map(int => int.id === id ? { ...int, isActive: newStatus } : int));

    try {
      await IntegrationsService.updateIntegration(currentWorkspace.id, id, { is_visible: newStatus });
      toast.success(`Integration is now ${newStatus ? 'visible' : 'hidden'}`);
    } catch (error) {
      console.error("Toggle failed:", error);
      // Rollback
      setIntegrations(prev => prev.map(int => int.id === id ? { ...int, isActive: currentStatus } : int));
      toast.error("Failed to update integration status");
    }
  };

  const handleRemove = async (id: string) => {
    if (!currentWorkspace?.id || !id) return;
    if (!confirm("Are you sure you want to remove this integration?")) return;

    try {
      await IntegrationsService.deleteIntegration(currentWorkspace.id, id);
      setIntegrations(prev => prev.filter(int => int.id !== id));
      toast.success("Integration removed");
    } catch (error) {
      console.error("Remove failed:", error);
      toast.error("Failed to remove integration");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-muted/30 min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Integrations - {currentWorkspace?.name || 'Loading...'}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Link your important resources and materials to BuildTracker
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          Add Integrations
        </button>
      </div>

      {/* Content Wrapper */}
      <div className="rounded-[2.5rem] bg-card p-4 md:p-8 border border-border shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                {...integration}
                onToggle={() => integration.id && handleToggleActive(integration.id, integration.isActive)}
                onRemove={() => integration.id && handleRemove(integration.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AddIntegrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddIntegration}
      />
    </div>
  );
}
