"use client"

import { Plus } from "lucide-react";
import Image from "next/image";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { useAuth } from "@/libs/hooks/useAuth";
import { quickLinksService } from "@/libs/api/services";

import QuickLinkCard from "@/app/components/quick-links/QuickLinkCard"
import AddLinksModal from "@/app/components/quick-links/modal/AddLinksModal";
import { useState, useEffect } from "react";

export default function QuickLinksPage() {
  const [open, setOpen] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      if (currentWorkspace?.id) {
        setLoading(true);
        try {
          // Fetch shared quick links
          const sharedLinksRes = await quickLinksService.getSharedQuickLinks(currentWorkspace.id, { _t: Date.now() });
          const sharedLinks = sharedLinksRes.data.shared_links || [];

          setLinks(sharedLinks);
        } catch (error) {
          console.error("Failed to fetch quick links:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLinks();
  }, [currentWorkspace?.id]);

  return (
    <div className="p-6 space-y-6 bg-muted min-h-screen">
      <AddLinksModal
        open={open}
        onClose={() => setOpen(false)}
        onLinkAdded={() => {
          // Refresh links
          if (currentWorkspace?.id) {
            quickLinksService.getSharedQuickLinks(currentWorkspace.id, { _t: Date.now() }).then(res => setLinks(res.data.shared_links || []));
          }
        }}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quick Links - {currentWorkspace?.name || 'Loading...'}</h1>
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
      <div className="rounded-3xl bg-background p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : links.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {links.map((link: any) => (
              <QuickLinkCard
                key={link.id}
                title={link.title}
                url={link.url}
                icon={link.icon}
                category={link.category}
                description={link.description}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No quick links found. Add your first link!
          </div>
        )}
      </div>
    </div>
  );
}
