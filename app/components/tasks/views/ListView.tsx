"use client";

import React from "react";
import { TaskStatus, TaskPriority } from "@/app/constants/tasks";
import Image from "next/image";
import { Paperclip, MessageSquare } from "lucide-react";
import { useTaskStore } from "@/app/store/taskStore";

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const statusColors: Record<TaskStatus, string> = {
  Pending: "bg-slate-400",
  "In Progress": "bg-blue-500",
  Completed: "bg-emerald-500",
};

const priorityStyles: Record<TaskPriority, string> = {
  High: "text-red-600",
  Medium: "text-orange-600",
  Low: "text-green-600",
};

const priorityDots: Record<TaskPriority, string> = {
  High: "bg-red-500",
  Medium: "bg-orange-500",
  Low: "bg-green-500",
};

const ListView = () => {
  const { tasks } = useTaskStore();

  return (
    <div className="w-full overflow-x-auto p-6">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium">
            <th className="px-4 py-3 border-b">
              <input type="checkbox" className="rounded border-gray-300" />
            </th>
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
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="hover:bg-muted/30 transition-colors group"
            >
              <td className="px-4 py-4 border-b">
                <input type="checkbox" className="rounded border-gray-300" />
              </td>
              <td className="px-4 py-4 border-b font-medium text-muted-foreground">
                {task.ticketNo}
              </td>
              <td className="px-4 py-4 border-b font-semibold text-foreground">
                {task.title}
              </td>
              <td className="px-4 py-4 border-b">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      statusColors[task.status],
                    )}
                  />
                  <span className="text-muted-foreground font-medium">
                    {task.status}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 border-b">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      priorityDots[task.priority],
                    )}
                  />
                  <span
                    className={cn("font-medium", priorityStyles[task.priority])}
                  >
                    {task.priority}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="relative h-7 w-7 rounded-full overflow-hidden">
                    <Image
                      src={task.owner.avatar}
                      alt={task.owner.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-muted-foreground">
                    {task.owner.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 border-b text-muted-foreground font-medium">
                {task.dueDate}
              </td>
              <td className="px-4 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text border px-2 py-1 rounded-md text-[10px] font-bold">
                    <Paperclip className="h-3 w-3" /> {task.attachmentsCount}
                  </div>
                  <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-md text-[10px] font-bold">
                    <MessageSquare className="h-3 w-3" /> {task.commentsCount}
                  </div>
                  <div className="text-red-400 bg-red-50 px-2 py-1 rounded-md text-[10px] border border-red-100 font-bold">
                    !!
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListView;
