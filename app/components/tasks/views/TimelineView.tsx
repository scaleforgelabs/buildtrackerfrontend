"use client";

import React, { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { TaskPriority, TaskStatus } from "@/app/constants/tasks";
import { MessageCircle, TrendingUp, ChevronDown } from "lucide-react";
import { useTaskStore } from "@/app/store/taskStore";

const priorityBorderColors: Record<TaskPriority, string> = {
  High: "bg-[#FF4D4D]",
  Medium: "bg-[#FFA500]",
  Low: "bg-[#4CAF50]",
};

const priorityBadgeStyles: Record<TaskPriority, string> = {
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
};

const statusOptions: TaskStatus[] = ["Pending", "In Progress", "Completed"];

const TimelineView: React.FC = () => {
  const { tasks, updateTaskStatus } = useTaskStore();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[var(--border)] p-8 text-muted-foreground">
        No tasks to display
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-3 p-6 overflow-y-auto">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`
                        flex items-center gap-4 p-4 rounded-lg 
                        bg-muted transition-all duration-200
                        hover:shadow-md hover:bg-opacity-80 cursor-pointer
                    `}
        >
          <div
            className={`h-9 w-1  ${priorityBorderColors[task.priority]}
                         rounded-t-full rounded-b-full`}
          ></div>
          {/* Main Content Container */}
          <div className="flex items-center min-w-0">
            {/* Ticket and Title Row */}
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-[var(--primary)] whitespace-nowrap">
                {task.ticketNo}
              </span>
              <h3 className="text-sm font-bold text-[var(--card-foreground)] leading-tight flex-1 line-clamp-1">
                {task.title}
              </h3>
            </div>

            {/* Author and Meta Info Row */}
            <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
              <span className="font-medium">{task.owner.name}</span>
              <span className="text-[var(--border)]">•</span>
              <span className="whitespace-nowrap">Due: {task.dueDate}</span>
            </div>
          </div>

          {/* Right Side Metrics and Badges */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === task.id ? null : task.id);
                }}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold 
                  border shadow-none whitespace-nowrap transition-all
                  ${statusBadgeStyles[task.status] || statusBadgeStyles.Pending}
                  cursor-pointer hover:opacity-80
                `}
              >
                {task.status}
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Dropdown Menu */}
              {openDropdown === task.id && (
                <div className="absolute top-full right-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50 min-w-[140px]">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(task.id, status);
                        setOpenDropdown(null);
                      }}
                      className={`
                        w-full text-left px-4 py-2.5 text-xs font-medium
                        transition-colors first:rounded-t-lg last:rounded-b-lg
                        ${
                          task.status === status
                            ? "bg-[var(--muted)] text-[var(--card-foreground)]"
                            : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50"
                        }
                      `}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority Badge */}
            <Badge
              className={`
                                rounded-md px-2.5 py-0.5 text-xs font-semibold 
                                border shadow-none whitespace-nowrap
                                ${priorityBadgeStyles[task.priority]}
                            `}
            >
              {task.priority}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineView;
