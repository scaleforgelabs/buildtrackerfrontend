"use client";

import React, { useState } from "react";
import { Switch } from "@/app/components/ui/switch";
import { Package, Clock, FileText } from "lucide-react";

interface Module {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
}

const ModulesPage = () => {
  const [modules, setModules] = useState<Module[]>([
    {
      id: "planning",
      name: "Planning",
      icon: <Package className="h-6 w-6" />,
      description:
        "Manage your team members, their assignments and Manage workspace documents, materials...",
      enabled: true,
    },
    {
      id: "my-tasks",
      name: "My Tasks",
      icon: <Clock className="h-6 w-6" />,
      description:
        "Take control of your work by managing your personal tasks in the workspace and tick as you go.",
      enabled: true,
    },
    {
      id: "logs",
      name: "Logs",
      icon: <FileText className="h-6 w-6" />,
      description:
        "Manage your team members, their assignments and Manage workspace documents, materials...",
      enabled: true,
    },
  ]);

  const handleToggle = (id: string) => {
    setModules(
      modules.map((module) =>
        module.id === id ? { ...module, enabled: !module.enabled } : module,
      ),
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
      {/* Header */}
      <div className="">
        <div className="">
          <h1 className="text-4xl font-bold text-[var(--card-foreground)]">
            Modules
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Enhance your workspace with powerful modules and extensions
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="px-8 py-8 bg-background  h-full rounded-2xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:shadow-lg"
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
                <Switch
                  checked={module.enabled}
                  onCheckedChange={() => handleToggle(module.id)}
                  className="h-6"
                />
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {module.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModulesPage;
