'use client'

import { Plus } from "lucide-react";
import IntegrationCard from "@/app/components/integration/IntegrationCard"
import { Images } from "@/public";

const integrations = [
  {
    name: "Figma",
    category: "Design",
    categoryColor: "blue",
    description: "Manage your team members, their assignments and Manage workspace documents, materials...",
    icon: Images.logo, // Placeholder for Figma
    isActive: true,
  },
  {
    name: "GitHub",
    category: "Development",
    categoryColor: "purple",
    description: "Manage your team members, their assignments and Manage workspace documents, materials...",
    icon: Images.git,
    isActive: true,
  },
  {
    name: "Slack",
    category: "Communication",
    categoryColor: "green",
    description: "Manage your team members, their assignments and Manage workspace documents, materials...",
    icon: Images.slack,
    isActive: true,
  },
  {
    name: "Microsoft Teams",
    category: "Communication",
    categoryColor: "green",
    description: "Manage your team members, their assignments and Manage workspace documents, materials...",
    icon: Images.logo, // Placeholder
    isActive: true,
  },
  {
    name: "Microsoft365 Workspace",
    category: "Documentation",
    categoryColor: "orange",
    description: "Manage your team members, their assignments and Manage workspace documents, materials...",
    icon: Images.logo, // Placeholder
    isActive: true,
  },
  {
    name: "Hubspot CRM",
    category: "Marketing",
    categoryColor: "red",
    description: "Manage your team members, their assignments and Manage workspace documents, materials...",
    icon: Images.logo, // Placeholder
    isActive: true,
  },
  {
    name: "Mailchimp CRM",
    category: "Marketing",
    categoryColor: "red",
    description: "Manage your team members, their assignments and Manage workspace documents, materials...",
    icon: Images.logo, // Placeholder
    isActive: true,
  },
  {
    name: "Power BI Workspace",
    category: "Communication",
    categoryColor: "green",
    description: "Manage your team members, their assignments and Manage workspace documents, materials...",
    icon: Images.logo, // Placeholder
    isActive: true,
  },
  {
    name: "Zapier Automation",
    category: "Development",
    categoryColor: "purple",
    description: "Manage your team members, their assignments and Manage workspace documents, materials...",
    icon: Images.logo, // Placeholder
    isActive: true,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Integrations</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Link your important resources and materials to BuildTracker
          </p>
        </div>
        <button className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105">
          <Plus className="h-5 w-5" />
          Add Integrations
        </button>
      </div>

      {/* Content Wrapper */}
      <div className="rounded-[2.5rem] bg-card p-4 md:p-8 border border-border shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration, i) => (
            <IntegrationCard
              key={i}
              {...integration}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
