"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Image from "next/image";
import UserAvatar from "../../ui/UserAvatar";
import HighlightText from "../../ui/HighlightText";
import { Paperclip, MessageSquare } from "lucide-react";
import { Images } from "@/public";
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
    avatar?: string;
  };
  start_date: string;
  end_date: string;
  comments: any[];
  attachments: any[];
  has_blocker: boolean;
}

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const statusColors: Record<string, string> = {
  "pending": "bg-amber-500",
  "in_progress": "bg-blue-500",
  "completed": "bg-emerald-500",
  "blocked": "bg-red-500",
};

const priorityStyles: Record<string, string> = {
  "high": "text-red-600",
  "medium": "text-orange-600",
  "low": "text-green-600",
};

const priorityDots: Record<string, string> = {
  "high": "bg-red-500",
  "medium": "bg-orange-500",
  "low": "bg-green-500",
};

function ListViewContent({ tasks, loading, onTasksChange }: {
  tasks: TaskData[];
  loading: boolean;
  onTasksChange: (tasks: TaskData[]) => void;
}) {
  const { currentWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('q') || '';
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter tasks based on search query
  const filteredTasks = searchQuery && searchQuery.length >= 2
    ? tasks.filter(t =>
      t.task_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigned_user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigned_user?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : tasks;

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page if we filter and the current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "blocked", label: "Blocked" },
  ];

  const getStatusLabel = (status: string) => {
    return statusOptions.find(opt => opt.value === status)?.label || status;
  };

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const oldTasks = [...tasks];

    // OPTIMISTIC UPDATE: Update UI instantly
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    onTasksChange(updatedTasks);

    try {
      await api.put(`/tasks/${currentWorkspace?.id}/tasks/${taskId}/status/`, {
        status: newStatus,
        percent_complete: newStatus === 'completed' ? 100 : 0
      });
    } catch (error) {
      console.error("Failed to update task status", error);
      // REVERT: Fallback to old state if API fails
      onTasksChange(oldTasks);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6 text-center text-muted-foreground">
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto p-6" onClick={() => setOpenDropdown(null)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium">
            <th className="px-4 py-3 border-b"><input type="checkbox" className="rounded border-gray-300" /></th>
            <th className="px-4 py-3 border-b">Ticket No.</th>
            <th className="px-4 py-3 border-b">Task Name</th>
            <th className="px-4 py-3 border-b">Status</th>
            <th className="px-4 py-3 border-b">Priority</th>
            <th className="px-4 py-3 border-b">Owner</th>
            <th className="px-4 py-3 border-b">Timeline date</th>
            <th className="px-4 py-3 border-b">Tags</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {filteredTasks.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                {searchQuery ? `No tasks matching "${searchQuery}"` : 'No tasks found'}
              </td>
            </tr>
          ) : (
            paginatedTasks.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-muted/30 transition-colors group cursor-pointer"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') return;
                  if (currentWorkspace?.id) {
                    router.push(`/${currentWorkspace.id}/tasks/${task.id}`);
                  }
                }}
              >
                <td className="px-4 py-4 border-b" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-4 py-4 border-b font-medium text-muted-foreground">
                  {task.ticket_number}
                </td>
                <td className="px-4 py-4 border-b font-semibold text-foreground">
                  <HighlightText text={task.task_name} query={searchQuery} />
                </td>
                <td className="px-4 py-4 border-b" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === task.id ? null : task.id);
                      }}
                      className="flex items-center gap-2 hover:bg-muted/50 px-2 py-1 rounded-md transition-colors w-full"
                    >
                      <div className={cn("h-2.5 w-2.5 rounded-full", statusColors[task.status] || "bg-gray-400")} />
                      <span className="text-muted-foreground font-medium">{getStatusLabel(task.status)}</span>
                    </button>

                    {/* Status Dropdown Menu */}
                    {openDropdown === task.id && (
                      <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                        {statusOptions.map((statusOpt) => (
                          <button
                            key={statusOpt.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, statusOpt.value);
                              setOpenDropdown(null);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-muted",
                              task.status === statusOpt.value ? "text-primary bg-primary/5" : "text-muted-foreground"
                            )}
                          >
                            {statusOpt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2.5 w-2.5 rounded-full", priorityDots[task.priority] || "bg-gray-400")} />
                    <span className={cn("font-medium", priorityStyles[task.priority] || "text-gray-600")}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 border-b">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      user={{
                        first_name: task.assigned_user?.first_name,
                        last_name: task.assigned_user?.last_name,
                        avatar: task.assigned_user?.avatar
                      }}
                      size={28}
                      className="h-7 w-7"
                    />
                    <span className="text-muted-foreground">{task.assigned_user.first_name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 border-b text-muted-foreground font-medium">
                  {formatDate(task.end_date)}
                </td>
                <td className="px-4 py-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text border px-2 py-1 rounded-md text-[10px] font-bold">
                      <Paperclip className="h-3 w-3" /> {task.attachments.length}
                    </div>
                    <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-md text-[10px] font-bold">
                      <MessageSquare className="h-3 w-3" /> {task.comments.length}
                    </div>
                    {task.has_blocker && (
                      <div className="text-red-400 bg-red-50 px-2 py-1 rounded-md text-[10px] border border-red-100 font-bold">
                        !!
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Footer */}
      {filteredTasks.length > 0 && !loading && (
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
              Showing <span className="text-foreground">{filteredTasks.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredTasks.length)}</span> of{" "}
              <span className="text-foreground">{filteredTasks.length} tasks</span>
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
  );
};

const ListView = ({ tasks, loading, onTasksChange }: {
  tasks: any[];
  loading: boolean;
  onTasksChange: (tasks: any[]) => void;
}) => {
  return (
    <Suspense fallback={<div className="w-full p-6 text-center text-muted-foreground">Loading tasks...</div>}>
      <ListViewContent tasks={tasks} loading={loading} onTasksChange={onTasksChange} />
    </Suspense>
  );
};

export default ListView;
