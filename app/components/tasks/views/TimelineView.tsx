"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Badge } from "@/app/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/libs/api";

interface TaskData {
  id: string;
  ticket_number: number;
  task_name: string;
  status: string;
  priority: string;
  assigned_user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  start_date: string;
  end_date: string;
  comments: any[];
  attachments: any[];
  has_blocker: boolean;
}

const priorityBorderColors: Record<string, string> = {
  High: "bg-[#FF4D4D]",
  Medium: "bg-[#FFA500]",
  Low: "bg-[#4CAF50]",
};

const priorityBadgeStyles: Record<string, string> = {
  High: "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50",
  Medium:
    "bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50",
  Low: "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50",
};

const statusBadgeStyles: Record<string, string> = {
  Completed:
    "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50",
  "In Progress":
    "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
  Pending:
    "bg-gray-100 dark:bg-gray-950/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-900/50",
  Blocked:
    "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50",
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "blocked", label: "Blocked" },
];

function TimelineViewContent() {
  const { currentWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('q') || '';
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (!currentWorkspace?.id) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/tasks/${currentWorkspace.id}/tasks/?_t=${Date.now()}`);
        setTasks(response.data.results?.data || []);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentWorkspace?.id]);

  const filteredTasks = searchQuery && searchQuery.length >= 2
    ? tasks.filter(t =>
      t.task_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigned_user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigned_user?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : tasks;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find(opt => opt.value === status)?.label || status;
  };

  const capitalizePriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await api.put(`/tasks/${currentWorkspace?.id}/tasks/${taskId}/status/`, {
        status: newStatus,
        percent_complete: newStatus === 'completed' ? 100 : 0
      });
    } catch (error) {
      console.error("Failed to update task status", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl p-8 text-muted-foreground">
        Loading tasks...
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[var(--border)] p-8 text-muted-foreground">
        {searchQuery ? `No tasks matching "${searchQuery}"` : "No tasks to display"}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-3 p-6 overflow-y-auto">
      {filteredTasks.map((task) => {
        const priorityLabel = capitalizePriority(task.priority);
        const statusLabel = getStatusLabel(task.status);

        return (
          <div
            key={task.id}
            onClick={() => {
              if (currentWorkspace?.id) {
                router.push(`/${currentWorkspace.id}/tasks/${task.id}`);
              }
            }}
            className={`
    flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg
    bg-muted transition-all duration-200
    hover:shadow-md hover:bg-opacity-80 cursor-pointer
  `}
          >
            {/* Priority Bar */}
            <div
              className={`
      hidden sm:block h-9 w-1 
      ${priorityBorderColors[priorityLabel] || priorityBorderColors.Medium}
      rounded-full shrink-0
    `}
            ></div>

            {/* Main Content */}
            <div className="flex flex-col sm:flex-row sm:items-center min-w-0 flex-1 gap-2 sm:gap-3">
              {/* Top Row (Ticket + Title) */}
              <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                <span className="text-[10px] sm:text-xs font-bold text-[var(--primary)] whitespace-nowrap">
                  {task.ticket_number}
                </span>

                <h3 className="text-xs sm:text-sm font-bold text-[var(--card-foreground)] leading-tight line-clamp-2 sm:line-clamp-1 break-words">
                  {task.task_name}
                </h3>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs text-[var(--muted-foreground)] sm:ml-3">
                <span className="font-medium truncate max-w-[120px] sm:max-w-none">
                  {task.assigned_user.first_name}
                </span>

                <span className="text-[var(--border)]">•</span>

                <span className="whitespace-nowrap">
                  Due: {formatDate(task.end_date)}
                </span>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 sm:ml-auto">
              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === task.id ? null : task.id);
                  }}
                  className={`
          flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold
          border shadow-none whitespace-nowrap transition-all
          ${statusBadgeStyles[statusLabel] || statusBadgeStyles.Pending}
          cursor-pointer hover:opacity-80
        `}
                >
                  {statusLabel}
                  <ChevronDown className="h-3 w-3" />
                </button>

                {/* Dropdown */}
                {openDropdown === task.id && (
                  <div className="absolute right-0 top-full mt-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50 min-w-[130px] sm:min-w-[140px]">
                    {statusOptions.map((statusOpt) => (
                      <button
                        key={statusOpt.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, statusOpt.value);
                          setOpenDropdown(null);
                        }}
                        className={`
                w-full text-left px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-medium
                transition-colors first:rounded-t-lg last:rounded-b-lg
                ${
                  task.status === statusOpt.value
                    ? "bg-[var(--muted)] text-[var(--card-foreground)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50"
                }
              `}
                      >
                        {statusOpt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority Badge */}
              <Badge
                className={`
        rounded-md px-2 py-0.5 text-[10px] sm:text-xs font-semibold
        border shadow-none whitespace-nowrap
        ${priorityBadgeStyles[priorityLabel] || priorityBadgeStyles.Medium}
      `}
              >
                {priorityLabel}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const TimelineView = () => {
  return (
    <Suspense fallback={<div className="w-full p-6 text-center text-muted-foreground">Loading tasks...</div>}>
      <TimelineViewContent />
    </Suspense>
  );
};

export default TimelineView;
