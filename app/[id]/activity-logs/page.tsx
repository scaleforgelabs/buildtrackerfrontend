"use client";

import {
  Download,
  ChevronDown,
  Plus,
  Trash2,
  MessageSquare,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import NextImage from "next/image";
import { Images } from "@/public";
import UserAvatar from "@/app/components/ui/UserAvatar";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { api } from "@/libs/api";
import { useWorkspace } from "@/libs/hooks/useWorkspace";

interface Log {
  id: string;
  log_type: string;
  severity: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata: Record<string, any>;
  user_email: string;
  user_name: string;
  ip_address: string;
  created_at: string;
}

const getEventIcon = (logType: string) => {
  switch (logType) {
    case "task_create":
      return <Plus className="h-4 w-4 text-blue-500" />;
    case "task_delete":
      return <Trash2 className="h-4 w-4 text-red-500" />;
    case "task_update":
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    case "comment_create":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "member_add":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    default:
      return <Plus className="h-4 w-4 text-blue-500" />;
  }
};

const getEventName = (logType: string) => {
  const eventMap: Record<string, string> = {
    task_create: "Task Created",
    task_delete: "Task Deleted",
    task_update: "Task Updated",
    comment_create: "Comment Added",
    comment_delete: "Comment Deleted",
    member_add: "Member Added",
    member_remove: "Member Removed",
  };
  return eventMap[logType] || logType;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ActivityLogsPage() {
  const { currentWorkspace } = useWorkspace();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const pathname = usePathname();
  const isRouteActive = pathname.includes('/activity-logs');

  const { data: logsRes, isLoading: loading } = useQuery({
    queryKey: ['activityLogs', currentWorkspace?.id],
    queryFn: async () => {
      const wsId = currentWorkspace?.id;
      if (!wsId) return null;
      return api.get(`/logs/workspaces/${wsId}/logs/detailed`);
    },
    enabled: !!currentWorkspace?.id && isRouteActive,
    staleTime: 2 * 60 * 1000,
  });

  const logs: Log[] = (logsRes as any)?.data?.results?.data || (logsRes as any)?.data?.data || (logsRes as any)?.data || [];

  const totalPages = Math.ceil(logs.length / itemsPerPage) || 1;
  const paginatedLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Main Content Table Area */}
      <div className="rounded-[2.5rem] bg-card p-4 md:p-8 border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted rounded-2xl overflow-hidden">
                <th className="px-4 first:rounded-l-2xl">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded-md border-border text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Event
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Description
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground last:rounded-r-2xl">
                  Timeline date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded-md border-border text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          user={{
                            first_name: (log as any).first_name,
                            last_name: (log as any).last_name,
                            name: log.user_name,
                            email: log.user_email,
                            avatar: (log as any).user_avatar || "" // No avatar in logs response yet, use initials
                          }}
                          size={40}
                          className="h-10 w-10 border border-border"
                        />
                        <div>
                          <span className="font-semibold text-foreground block">
                            {log.user_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {log.user_email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg border border-border bg-white group-hover:bg-blue-50 transition-colors">
                          {getEventIcon(log.log_type)}
                        </div>
                        <span className="text-sm font-medium">
                          {getEventName(log.log_type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {log.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <p className="text-sm font-medium text-muted-foreground hidden md:block">
              Showing <span className="text-foreground">{logs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, logs.length)}</span> of{" "}
              <span className="text-foreground">{logs.length} logs</span>
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
      </div>
    </div>
  );
}