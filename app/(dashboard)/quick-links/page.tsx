"use client"

import { Plus } from "lucide-react";
import Image from "next/image";

import dynamic from "next/dynamic";
const QuickLinkCard = dynamic(() => import("@/app/components/quick-links/QuickLinkCard"), { ssr: false });
const AddLinksModal = dynamic(() => import("@/app/components/quick-links/modal/AddLinksModal"), { ssr: false });
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { quickLinksService } from "@/libs/api/services";
import { useAuth } from "@/libs/hooks/useAuth";

export default function QuickLinksPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const { data: linksRes, isLoading } = useQuery({
    queryKey: ['userQuickLinks', user?.id],
    queryFn: () => quickLinksService.getUserQuickLinks(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const links = (linksRes as any)?.data?.results?.data || (linksRes as any)?.data || [];

  return (
    <div className="p-6 space-y-6 bg-muted">
      <AddLinksModal open={open} onClose={() => setOpen(false)} onLinkAdded={() => queryClient.invalidateQueries({ queryKey: ["userQuickLinks"] })} />
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
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading quick links...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {links.map((link: any) => (
              <QuickLinkCard key={link.id} title={link.title} url={link.url} icon={link.icon} />
            ))}
            {links.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No quick links yet. Add your first important resource!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
