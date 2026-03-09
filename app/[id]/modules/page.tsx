"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/app/components/ui/switch";
import { Package, Clock, FileText } from "lucide-react";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { workspacesService } from "@/libs/api/services";

interface ModuleConfig {
  id: "planning" | "my_tasks" | "logs";
  name: string;
  icon: React.ReactNode;
  description: string;
}

const MODULES_CONFIG: ModuleConfig[] = [
  {
    id: "planning",
    name: "Planning",
    icon: <Package className="h-6 w-6" />,
    description: "Manage your team members, their assignments and Manage workspace documents, materials...",
  },
  {
    id: "my_tasks",
    name: "My Tasks",
    icon: <Clock className="h-6 w-6" />,
    description: "Take control of your work by managing your personal tasks in the workspace and tick as you go.",
  },
  {
    id: "logs",
    name: "Logs",
    icon: <FileText className="h-6 w-6" />,
    description: "Manage your team members, their assignments and Manage workspace documents, materials...",
  },
];

const ModulesPage = () => {
  const { currentWorkspace, workspaceSettings, setWorkspaceSettings } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentWorkspace?.user_role === 'Owner';

  const handleToggle = async (moduleId: "planning" | "my_tasks" | "logs") => {
    if (!currentWorkspace || !workspaceSettings || !isOwner) return;

    const newModulesState = {
      ...workspaceSettings.enabled_modules,
      [moduleId]: !workspaceSettings.enabled_modules[moduleId],
    };

    setLoading(true);
    setError(null);
    try {
      const resp = await workspacesService.updateSettings(currentWorkspace.id, {
        enabled_modules: newModulesState
      });
      setWorkspaceSettings(resp.data.settings);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update module settings.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentWorkspace || !workspaceSettings) {
    return (
      <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
        <div>
          <h1 className="text-4xl font-bold text-[var(--card-foreground)]">Modules</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full flex flex-col">
      {/* Header */}
      <div className="">
        <h1 className="text-4xl font-bold text-[var(--card-foreground)]">
          Modules - {currentWorkspace.name}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Enhance your workspace with powerful modules and extensions
        </p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      {/* Modules Grid */}
      <div className="px-5 py-8 md:px-8 bg-background flex-1 rounded-2xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MODULES_CONFIG.map((module) => {
            const isEnabled = workspaceSettings.enabled_modules[module.id];

            return (
              <div
                key={module.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:shadow-lg flex flex-col"
              >
                {/* Header with Icon and Toggle */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[var(--primary)] p-2.5 text-white">
                      {module.icon}
                    </div>
                    <h3 className="text-lg font-bold text-[var(--card-foreground)]">
                      {module.name}
                    </h3>
                  </div>
                  {isOwner && (
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleToggle(module.id)}
                      disabled={loading}
                      className="h-6"
                    />
                  )}
                  {!isOwner && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mt-auto">
                  {module.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModulesPage;
