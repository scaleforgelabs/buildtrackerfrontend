"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronDown,
  LayoutDashboard,
  CheckSquare,
  Users,
  BookOpen,
  Link2,
  Plug,
  Boxes,
  BarChart3,
  Plus,
  Menu,
  X,
  Bell,
  ListCheck,
  ListChecks,
} from "lucide-react";
import { Images } from "@/public";
import { useRouter, usePathname } from "next/navigation";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import CreateWorkspaceModal from "./modals/CreateWorkspaceModal";
import { workspacesService } from "@/libs/api/services";
// import { useWorkspace } from "@/libs/hooks/useWorkspace";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, link: "/home" },
  { label: "Tasks", icon: CheckSquare, link: "/tasks" },
  { label: "Team", icon: Users, link: "/team" },
  { label: "Wiki", icon: BookOpen, link: "/wiki" },
  { label: "Quick Links", icon: Link2, link: "/quick-links" },
  // { label: "Integrations", icon: Plug, link: "/integrations" },
  { label: "Modules", icon: Boxes, link: "/modules" },
  { label: "Reports", icon: BarChart3, link: "/reports" },
  { label: "Activity Logs", icon: LayoutDashboard, link: "/activity-logs" },
  { label: "Notifications", icon: Bell, link: "/notifications" },
  { label: "My tasks", icon: ListChecks, link: "/my-tasks", global: true },
];
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    switchWorkspace,
    workspaceSettings,
  } = useWorkspace();
  const router = useRouter();
  const pathname = usePathname();
  // const { workspaces, currentWorkspace, setCurrentWorkspace, loading } = useWorkspace();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card p-2 rounded-lg shadow-md border border-border"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      <aside
        className={`h-screen bg-background p-4 fixed lg:relative z-50 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Grey container */}
        <div
          className={`h-full bg-muted rounded-2xl transition-all duration-300 flex flex-col justify-between ${collapsed ? "w-16" : "w-72"
            }`}
        >
          <div className={`${collapsed ? "px-2 pt-3" : "px-4 pt-4"}`}>
            {/* Logo */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCollapsed((v) => !v)}
                className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} flex-1`}
              >
                <Image
                  src={Images.logo}
                  alt="Logo"
                  priority
                  className="w-8 h-8"
                />
                {!collapsed && (
                  <span className="font-semibold text-base text-foreground">
                    BuildTracker
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workspace Box */}
            {!collapsed && (
              <div className="mb-6 rounded-xl border border-sidebar-border bg-card overflow-hidden">
                <button
                  onClick={() => setWorkspaceOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-sidebar-accent"
                >
                  {currentWorkspace ? (
                    <div>
                      <p className="text-sm font-medium text-foreground py-1">
                        {currentWorkspace.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentWorkspace.user_role}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-foreground py-1">
                        Select Workspace
                      </p>
                    </div>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${workspaceOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {workspaceOpen && (
                  <div className="border-t border-border max-h-48 overflow-y-auto">
                    {workspaces.map((ws: any) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          switchWorkspace(ws);
                          setWorkspaceOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-sidebar-accent ${currentWorkspace?.id === ws.id
                            ? "bg-sidebar-accent"
                            : ""
                          }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm font-medium">{ws.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ws.user_role}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="border-t border-border">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex w-full items-center gap-2 px-3 py-3 text-sm hover:bg-sidebar-accent"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-sidebar-border">
                      <Plus className="w-4 h-4" />
                    </span>
                    New Workspace
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            {!collapsed && (
              <div className="border-t border-sidebar-border -mx-4 mb-4" />
            )}

            {/* Navigation */}

            <nav className="space-y-1">
              {(() => {
                const filteredNavItems = navItems.filter((item) => {
                  if (!workspaceSettings?.enabled_modules) return true;
                  const modules = workspaceSettings.enabled_modules;

                  // Planning currently hides nothing based on user request
                  if (!modules.my_tasks && item.label === "My tasks")
                    return false;
                  if (!modules.logs && item.label === "Activity Logs")
                    return false;

                  return true;
                });

                return filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const workspaceBasedLink =
                    currentWorkspace && !item.global
                      ? `/${currentWorkspace.id}${item.link}`
                      : item.link;
                  const isActive =
                    pathname === workspaceBasedLink ||
                    (item.global && pathname.startsWith(item.link));

                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        if (item.global) {
                          router.push(workspaceBasedLink);
                        } else if (currentWorkspace) {
                          router.push(workspaceBasedLink);
                        } else {
                          router.push(workspaceBasedLink);
                        }
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center rounded-xl transition-colors ${collapsed ? "justify-center p-2" : "gap-3 px-3 py-2"
                        } ${isActive
                          ? "font-semibold text-foreground bg-secondary"
                          : "text-muted-foreground hover:bg-secondary/50"
                        }`}
                    >
                      <Icon
                        className={`${collapsed ? "w-6 h-6" : "w-5 h-5"} ${isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                      />

                      {!collapsed && (
                        <span className="text-sm">{item.label}</span>
                      )}
                    </button>
                  );
                });
              })()}
            </nav>
          </div>

          {/* Bottom Card */}
          {!collapsed && (
            <div className="p-4">
              <div
                className="rounded-2xl bg-blue-500/50 text-white p-6 relative space-y-7 overflow-hidden"
                style={{
                  backgroundImage: `url(${Images.desktopbg.src || Images.desktopbg})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  minHeight: "6rem",
                }}
              >
                <div className="absolute inset-0 rounded-2xl" />
                <div className="space-y-3 relative z-10">
                  <div className="h-6 w-6 bg-white border rounded-full p-0.5">
                    <Image src={Images.logo} alt="Logo" priority />
                  </div>

                  <p className="font-semibold text-xl">
                    Download our Mobile App
                  </p>
                  <p className="text-xs opacity-80 mb-3">
                    Manage your team effortlessly
                  </p>
                </div>
                <button className="w-full rounded-full bg-background text-primary py-2 text-sm font-medium">
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
