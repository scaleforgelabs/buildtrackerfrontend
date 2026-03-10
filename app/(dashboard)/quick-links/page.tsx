"use client"

import { Plus } from "lucide-react";
import Image from "next/image";

import QuickLinkCard from "@/app/components/quick-links/QuickLinkCard"
import AddLinksModal from "@/app/components/quick-links/modal/AddLinksModal";
import { useState } from "react";

export default function QuickLinksPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-6 space-y-6 bg-muted">
      <AddLinksModal open={open} onClose={() => setOpen(false)} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quick Links</h1>
          <p className="text-sm text-muted-foreground">
            Link your important resources and materials to BuildTracker
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow"
          onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add
          <span className="hidden md:flex">
            Custom Link
          </span>
        </button>
      </div>

      {/* Card Wrapper */}
      <div className="rounded-3xl bg-background p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLinkCard title="Buildtracker Website" />
          <QuickLinkCard title="Buildtracker Design" />
          <QuickLinkCard title="Scaleforge Website" icon="scaleforge" />
          <QuickLinkCard title="Buildtracker Whatsapp" />
          <QuickLinkCard title="Slack Invitation" />
          <QuickLinkCard title="Buildtracker Drive" />
          <QuickLinkCard title="Scaleforge Lab Brand" icon="scaleforge" />
          <QuickLinkCard title="BuildTracker GitHub" />
          <QuickLinkCard title="Canva Workspace" />
          <QuickLinkCard title="Dribbble Workspace" />
          <QuickLinkCard title="Hubspot" />
          <QuickLinkCard title="Microsoft 365" />
        </div>
      </div>
    </div>
  );
}
