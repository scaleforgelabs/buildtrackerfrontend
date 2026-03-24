"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BoardTaskCard } from "../BoardTaskCard";
import { Plus } from "lucide-react";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { useRouter } from "next/navigation";
import api from "@/libs/api";
import { Images } from "@/public";

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
}

interface BoardColumnProps {
  status: string;
  tasks: TaskData[];
  image: any;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onTaskClick: (taskId: string) => void;
}

const BoardColumn = ({
  status,
  tasks,
  image,
  onStatusChange,
  onTaskClick,
}: BoardColumnProps) => {
  return (
    <div className="flex flex-col rounded-2xl bg-muted/30 p-4 border border-border min-h-[500px] transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Image src={image} alt={status} width={16} height={16} className="h-4 w-4" />
          <h2 className="text-base font-bold text-foreground">
            {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}{" "}
            <span className="text-muted-foreground font-medium ml-1">
              ({tasks.length})
            </span>
          </h2>
        </div>
        <button className="h-7 w-7 rounded-full border border-primary flex items-center justify-center text-primary hover:bg-primary/5 transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <BoardTaskCard
            key={task.id}
            task={task as any}
            onStatusChange={onStatusChange}
            onClick={() => onTaskClick(task.id)}
          />
        ))}
      </div>
    </div>
  );
};

const BoardView = () => {
  const { currentWorkspace } = useWorkspace();
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace?.id) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/tasks/${currentWorkspace.id}/tasks/?_t=${Date.now()}`,
        );
        setTasks(response.data.results?.data || []);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentWorkspace?.id]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const oldTasks = [...tasks];

    // OPTIMISTIC UPDATE: Update UI instantly
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );

    try {
      await api.put(`/tasks/${currentWorkspace?.id}/tasks/${taskId}/status/`, {
        status: newStatus,
        percent_complete: newStatus === "completed" ? 100 : 0,
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
      // REVERT: Fallback to old state if API fails
      setTasks(oldTasks);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading tasks...
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const handleTaskClick = (taskId: string) => {
    if (currentWorkspace?.id) {
      router.push(`/${currentWorkspace.id}/tasks/${taskId}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-1 p-6 ">
      <BoardColumn
        status="pending"
        tasks={pendingTasks}
        image={Images.pending}
        onStatusChange={handleStatusChange}
        onTaskClick={handleTaskClick}
      />
      <BoardColumn
        status="in_progress"
        tasks={inProgressTasks}
        image={Images.progress}
        onStatusChange={handleStatusChange}
        onTaskClick={handleTaskClick}
      />
      <BoardColumn
        status="completed"
        tasks={completedTasks}
        image={Images.complete}
        onStatusChange={handleStatusChange}
        onTaskClick={handleTaskClick}
      />
    </div>
  );
};

export default BoardView;
