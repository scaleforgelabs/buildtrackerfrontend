"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { useAuth } from "@/libs/hooks/useAuth";
import { quickLinksService } from "@/libs/api/services";

import QuickLinkCard from "@/app/components/quick-links/QuickLinkCard";
import AddLinksModal from "@/app/components/quick-links/modal/AddLinksModal";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: string;
  description?: string;
  created_at: string;
}

export default function QuickLinksPage() {
  const [open, setOpen] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const pathname = usePathname();
  const isRouteActive = pathname.includes('/quick-links');
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const { data: linksRes, isLoading: loading } = useQuery({
    queryKey: ['sharedQuickLinks', currentWorkspace?.id],
    queryFn: async () => {
      const wsId = currentWorkspace?.id;
      if (!wsId) return null;
      return quickLinksService.getSharedQuickLinks(wsId, { _t: Date.now() });
    },
    enabled: !!currentWorkspace?.id && isRouteActive,
    staleTime: 5 * 60 * 1000,
  });

  const links: QuickLink[] = (linksRes as any)?.data?.shared_links || [];

  const totalPages = Math.ceil(links.length / itemsPerPage) || 1;
  const paginatedLinks = links.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['sharedQuickLinks', currentWorkspace?.id] });
  };

  return (
    <div className="p-6 space-y-6 bg-muted min-h-screen">
      <AddLinksModal
        open={open}
        onClose={() => setOpen(false)}
        onLinkAdded={handleRefresh}
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quick Links - {currentWorkspace?.name || "Loading..."}
          </h1>
          <p className="text-sm text-muted-foreground">
            Link your important resources and materials to BuildTracker
          </p>
        </div>
        <button
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add
          Custom Link
        </button>
      </div>

      {/* Card Wrapper */}
      <div className="rounded-3xl bg-background p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : links.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {paginatedLinks.map((link: any) => (
              <QuickLinkCard
                key={link.id}
                id={link.id}
                title={link.title}
                url={link.url}
                icon={link.icon}
                category={link.category}
                description={link.description}
                onSaved={handleRefresh}
                onDeleted={handleRefresh}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No quick links found. Add your first link!
          </div>
        )}

        {/* Pagination Footer */}
        {links.length > 0 && !loading && (
          <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 px-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-9 w-[70px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
              </div>
              <p className="text-sm font-medium text-muted-foreground hidden md:block">
                Showing <span className="text-foreground">{links.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, links.length)}</span> of{" "}
                <span className="text-foreground">{links.length} links</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-6 py-2.5 rounded-xl border border-border bg-white text-sm font-bold text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-bold bg-muted rounded-xl border border-border">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-6 py-2.5 rounded-xl border border-border bg-white text-sm font-bold text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
