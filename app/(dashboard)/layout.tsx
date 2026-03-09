"use client";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/Topbar";
import { WorkspaceProvider } from "@/libs/hooks/useWorkspace";
import ClientWrapper from "@/app/components/ClientWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ClientWrapper>
      <WorkspaceProvider>
        <div className="flex h-screen bg-background">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
            <div className="flex-1 flex flex-col p-2.5 md:p-6 gap-4 overflow-hidden">
              <TopBar />
              <div className="flex-1 overflow-auto scrollbar-hide rounded-[2rem] bg-card">
                {children}
              </div>
            </div>
          </div>
        </div>
      </WorkspaceProvider>
    </ClientWrapper>
  );
}