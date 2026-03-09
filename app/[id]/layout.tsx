"use client";

import { useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Sidebar from "../components/Sidebar";
import TopBar from "../components/Topbar";
import { WorkspaceProvider, useWorkspace } from "@/libs/hooks/useWorkspace";
import ClientWrapper from "@/app/components/ClientWrapper";
import { useSearchHighlight } from "@/libs/hooks/useSearchHighlight";

function SearchHighlighter({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  useSearchHighlight(containerRef);
  return null;
}

function WorkspaceLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { setCurrentWorkspace, workspaces, workspaceSettings } = useWorkspace();
  const workspaceId = params?.id as string;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const workspace = workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        setCurrentWorkspace(workspace);
      }
    }
  }, [workspaceId, workspaces, setCurrentWorkspace]);

  // Route protection based on enabled modules
  useEffect(() => {
    if (!workspaceSettings?.enabled_modules) return;

    const modules = workspaceSettings.enabled_modules;
    const pathParts = pathname.split('/');
    const currentRoute = pathParts[pathParts.length - 1]; // e.g., 'tasks', 'wiki', 'my-tasks'

    let shouldRedirect = false;

    // Planning currently hides nothing
    if (!modules.my_tasks && currentRoute === 'my-tasks') {
      shouldRedirect = true;
    } else if (!modules.logs && currentRoute === 'activity-logs') {
      shouldRedirect = true;
    }

    if (shouldRedirect) {
      router.replace(`/${workspaceId}/home`);
    }
  }, [pathname, workspaceSettings, router, workspaceId]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        <div className="flex-1 flex flex-col p-2.5 md:p-6 gap-4 overflow-hidden">
          <Suspense fallback={null}>
            <TopBar />
          </Suspense>
          <div
            ref={contentRef}
            data-search-highlight-root
            className="flex-1 overflow-auto scrollbar-hide rounded-[2rem] bg-card"
          >
            {children}
          </div>
          <Suspense fallback={null}>
            <SearchHighlighter containerRef={contentRef} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientWrapper>
      <WorkspaceProvider>
        <WorkspaceLayoutContent>
          {children}
        </WorkspaceLayoutContent>
      </WorkspaceProvider>
    </ClientWrapper>
  );
}