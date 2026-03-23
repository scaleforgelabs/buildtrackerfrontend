"use client";

import { useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import { Check, Loader2 } from "lucide-react";
import { Images } from "@/public";
import Link from "next/link";
import { notificationsService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import UserAvatar from "@/app/components/ui/UserAvatar";

interface NotificationItem {
  id: string;
  user: string;
  userId: string;
  avatar: StaticImageData | string;
  action: string;
  target: string;
  targetLink?: string;
  context?: string;
  time: string;
  workspace: string;
  isRead: boolean;
  type: string;
  content?: string;
  assignedTo?: string;
  fileCheck?: boolean;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace, workspaces } = useWorkspace();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const workspaceUnreadCount = notifications.filter(
    (n) => !n.isRead && n.workspace === currentWorkspace?.name,
  ).length;

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const transformApiData = (apiNotifications: any[]): NotificationItem[] => {
    return apiNotifications.map((notification) => {
      // Find the workspace by ID from the workspaces list
      const workspace = workspaces.find(
        (ws) => ws.id === notification.workspace,
      );
      const workspaceName = workspace?.name || "Unknown Workspace";

      // Extract assignee name from description for task_assigned
      let assignedTo = "User";
      if (
        notification.note_type === "task_assigned" &&
        notification.description
      ) {
        // Extract name from description like: 'You have been assigned to "task name" by {Name}'
        const match = notification.description.match(/by (.+)$/);
        if (match) {
          assignedTo = match[1];
        }
      }

      const stripHtmlTags = (str: string | undefined): string | undefined => {
        if (!str) return str;
        return str.replace(/<[^>]*>?/gm, "");
      };

      return {
        id: notification.id,
        user: notification.user_name || "User",
        userId: notification.user,
        avatar: notification.user_avatar || "",
        action: notification.action.split(":")[0] || notification.action,
        target:
          notification.action.split(":")[1]?.trim() ||
          notification.description ||
          "Task",
        context:
          notification.note_type === "task_assigned"
            ? "Tasks"
            : notification.note_type === "deadline_approaching"
              ? "Tasks"
              : notification.note_type?.includes("wiki")
                ? "to Wiki"
                : notification.note_type?.includes("link")
                  ? "to Quick Links"
                  : "Tasks",
        time: formatTimeAgo(notification.created_at),
        workspace: workspaceName,
        isRead: notification.is_read,
        type:
          notification.note_type === "task_assigned"
            ? "assign"
            : notification.note_type === "deadline_approaching"
              ? "comment"
              : notification.note_type?.includes("upload")
                ? "upload"
                : notification.note_type?.includes("add")
                  ? "add"
                  : "comment",
        content: stripHtmlTags(notification.description),
        assignedTo: assignedTo,
        fileCheck: notification.note_type?.includes("upload") || false,
        targetLink: notification.note_type?.includes("add") ? "#" : undefined,
      };
    });
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        activeTab === "all"
          ? await notificationsService.getNotifications()
          : currentWorkspace
            ? await notificationsService.getWorkspaceNotifications(
                currentWorkspace.id,
              )
            : await notificationsService.getNotifications();

      const transformedData = transformApiData(response.data.results.data);
      setNotifications(transformedData);
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = async (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (notification && !notification.isRead) {
      try {
        await notificationsService.markAsRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab, currentWorkspace]);

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
        <div className="text-center py-20">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchNotifications}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Notification
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground mt-1">
            Stay on top of your workspace updates...
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Check className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-border/60">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${
              activeTab === "all"
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            All
            {unreadCount > 0 && (
              <span
                className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "all" ? "bg-blue-100" : "bg-muted-foreground/10"}`}
              >
                {unreadCount}
              </span>
            )}
          </button>
          {currentWorkspace && (
            <button
              onClick={() => setActiveTab("workspace")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${
                activeTab === "workspace"
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {currentWorkspace.name}&apos;s Workspace
              {workspaceUnreadCount > 0 && (
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "workspace" ? "bg-blue-100" : "bg-muted-foreground/10"}`}
                >
                  {workspaceUnreadCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-card rounded-[2rem] border border-border shadow-sm divide-y divide-border overflow-hidden">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 sm:p-6 hover:bg-muted/40 transition-colors duration-200 cursor-pointer group ${
              !notification.isRead ? "bg-blue-50/10" : ""
            }`}
            onClick={() => handleNotificationClick(notification.id)}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Unread Indicator */}
              <div className="pt-2 sm:pt-3 shrink-0">
                <div
                  className={`w-2 h-2 rounded-full ${
                    !notification.isRead ? "bg-blue-600" : "bg-transparent"
                  }`}
                />
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <UserAvatar
                  user={{
                    name: notification.user,
                    avatar: notification.avatar,
                  }}
                  size={36}
                  className="w-9 h-9 sm:w-10 sm:h-10 border border-border"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                {/* Main Text */}
                <div className="text-sm sm:text-[15px] leading-relaxed break-words">
                  <span className="text-foreground/80 px-1">
                    {notification.action}
                  </span>
                  <span className="font-bold text-foreground">
                    {notification.target}
                  </span>
                  {notification.context && (
                    <span className="text-foreground/80 pl-1">
                      {notification.context}
                    </span>
                  )}
                </div>

                {/* Meta Info */}
                <div className="text-[10px] sm:text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                  <span>
                    {notification.context?.includes("Tasks") ||
                    notification.action === "commented on"
                      ? "Tasks"
                      : notification.context?.includes("Quick Links")
                        ? "Quick Links"
                        : "Wiki"}
                  </span>
                  <span>•</span>
                  <span>{notification.time}</span>
                  <span>•</span>
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {notification.workspace}
                  </span>
                </div>

                {/* Extra content */}
                {(notification.type === "assign" ||
                  notification.type === "comment") &&
                  notification.content && (
                    <p className="mt-2 text-sm text-foreground/70 break-words">
                      {notification.content}
                    </p>
                  )}

                {/* File */}
                {notification.type === "upload" && notification.fileCheck && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileTextIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">PRD Document.pdf</span>
                  </div>
                )}

                {/* Link */}
                {notification.targetLink && (
                  <div className="mt-2">
                    <Link
                      href={notification.targetLink}
                      className="text-sm font-medium text-blue-600 hover:underline break-words"
                    >
                      {notification.target}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-16 sm:py-20 px-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-muted rounded-full mx-auto flex items-center justify-center mb-4 text-muted-foreground">
              <span className="text-xl sm:text-2xl">📭</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-foreground">
              No updates
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You&apos;re all caught up!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple icons for specific notification types content
function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}
