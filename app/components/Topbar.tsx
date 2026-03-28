"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Moon,
  Settings,
  Sun,
  LogOut,
  CheckSquare,
  BookOpen,
  Users,
  Link2,
  Plug,
  FileText,
  FolderOpen,
  Loader2,
  X,
  ChevronUp,
} from "lucide-react";
import { Images } from "@/public";
import { useTheme } from "next-themes";
import { logout } from "@/libs/api/auth";
import { useState, useRef, useEffect } from "react";

import { useAuth } from "@/libs/hooks/useAuth";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { useSearch } from "@/libs/hooks/useSearch";
import UserAvatar from "./ui/UserAvatar";
import { SearchResult } from "@/app/services/search";

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  task: { label: "Task", icon: CheckSquare, color: "text-blue-600 bg-blue-50" },
  wiki: { label: "Wiki", icon: BookOpen, color: "text-green-600 bg-green-50" },
  integration: {
    label: "Integration",
    icon: Plug,
    color: "text-purple-600 bg-purple-50",
  },
  team: { label: "Team", icon: Users, color: "text-orange-600 bg-orange-50" },
  quicklink: {
    label: "Quick Link",
    icon: Link2,
    color: "text-cyan-600 bg-cyan-50",
  },
  log: { label: "Activity", icon: FileText, color: "text-gray-600 bg-gray-50" },
  notification: {
    label: "Notification",
    icon: Bell,
    color: "text-red-600 bg-red-50",
  },
  file: {
    label: "File",
    icon: FolderOpen,
    color: "text-amber-600 bg-amber-50",
  },
};

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const { query, setQuery, results, loading, isOpen, setIsOpen, clearSearch } =
    useSearch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen, setIsUserDropdownOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsUserDropdownOpen(false);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    const workspaceId = result.workspace_id || currentWorkspace?.id;
    const qParam = query ? `?q=${encodeURIComponent(query)}` : "";
    if (workspaceId) {
      router.push(`/${workspaceId}${result.url}${qParam}`);
    } else {
      router.push(`${result.url}${qParam}`);
    }
  };

  // Group results by type
  const groupedResults = results.reduce<Record<string, SearchResult[]>>(
    (acc, result) => {
      if (!acc[result.type]) acc[result.type] = [];
      acc[result.type].push(result);
      return acc;
    },
    {},
  );

  return (
    <header className="z-30 bg-background lg:left-80">
      <div className="flex items-center justify-between rounded-2xl bg-muted pl-14 pr-3 md:px-6 py-2 md:py-3 gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-xl" ref={dropdownRef}>
          <div className="flex items-center gap-2 bg-card rounded-full px-4 py-3">
            {loading ? (
              <Loader2 className="w-4 h-4 text-muted-foreground flex-shrink-0 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setIsOpen(true)}
              placeholder="Search for task, people, documents and more..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground hidden sm:block"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setIsOpen(true)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:hidden"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="flex-shrink-0 p-0.5 rounded-full hover:bg-muted"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Results Dropdown */}
          {isOpen && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl border border-border shadow-xl max-h-[70vh] overflow-y-auto z-50">
              {loading && results.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Searching...
                  </span>
                </div>
              ) : results.length === 0 ? (
                <div className="py-8 text-center">
                  <Search className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No results found for &quot;{query}&quot;
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {Object.entries(groupedResults).map(([type, items]) => {
                    const config = TYPE_CONFIG[type] || {
                      label: type,
                      icon: FileText,
                      color: "text-gray-600 bg-gray-50",
                    };
                    const Icon = config.icon;
                    return (
                      <div key={type}>
                        <div className="px-4 py-2 flex items-center gap-2">
                          <div className={`p-1 rounded-md ${config.color}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {config.label} ({items.length})
                          </span>
                        </div>
                        {items.slice(0, 5).map((result) => (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleResultClick(result)}
                            className="w-full px-4 py-2.5 flex items-start gap-3 hover:bg-muted/60 transition-colors text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {result.title}
                              </p>
                              {result.content && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {result.content}
                                </p>
                              )}
                            </div>
                            {result.workspace_name && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                                {result.workspace_name}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/notifications" className="md:flex hidden" aria-label="View notifications">
            <button
              aria-label="Notifications"
              className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5 text-foreground" aria-hidden="true" />
            </button>
          </Link>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition hidden sm:flex"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 md:w-5 md:h-5 text-foreground" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 md:w-5 md:h-5 text-foreground" aria-hidden="true" />
            )}
          </button>

          <Link href="/settings" className="hidden sm:flex" aria-label="Settings">
            <button
              aria-label="Settings"
              className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5 text-foreground" aria-hidden="true" />
            </button>
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition hover:bg-red-50 hover:border-red-200 group hidden sm:flex"
            title="Logout"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5 text-foreground group-hover:text-red-600" />
          </button>

          {/* User - Mobile Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 pl-2 hover:opacity-80 transition"
            >
              <UserAvatar
                user={user}
                size={48}
                className="md:w-12 md:h-12 w-10 h-10"
              />
              <div className="leading-tight hidden lg:block">
                <p className="text-sm font-medium text-foreground">
                  {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || "..."}
                </p>
              </div>
            </button>

            {/* Dropdown Menu - Mobile */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-lg p-4 z-50 sm:hidden">
                {/* User Info Header */}
                <div className="pb-4 border-b border-border mb-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} size={48} className="w-12 h-12" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {user ? `${user.first_name} ${user.last_name}` : "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email || "No email"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  {/* Notifications */}
                  <Link
                    href="/notifications"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition text-foreground text-sm font-medium">
                      <Bell className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>Notifications</span>
                    </button>
                  </Link>

                  {/* Theme Toggle */}
                  <button
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark");
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition text-foreground text-sm font-medium"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>

                  {/* Settings */}
                  <Link
                    href="/settings"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition text-foreground text-sm font-medium">
                      <Settings className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>Settings</span>
                    </button>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition text-red-600 text-sm font-medium disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
