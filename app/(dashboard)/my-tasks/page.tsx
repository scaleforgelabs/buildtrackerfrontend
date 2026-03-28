"use client";

import React, { useState, useEffect } from "react";
import { Trash2, MoreVertical, Plus, Calendar, Clock, ArrowUp, Upload, MoreHorizontal, Edit2 } from "lucide-react";
import dynamic from "next/dynamic";
const AddPersonalTaskModal = dynamic(() => import("@/app/components/modals/AddPersonalTaskModal"), { ssr: false });
const EditPersonalTaskModal = dynamic(() => import("@/app/components/modals/EditPersonalTaskModal"), { ssr: false });
import { personalTasksService } from "@/libs/api/services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/libs/hooks/useAuth";
import toast from "react-hot-toast";

interface PersonalTask {
  id: string;
  title: string;
  deadline?: string;
  completed: boolean;
}

const MyTasksPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PersonalTask | null>(null);

  // 1. Fetch Tasks
  const { data: tasksRes, isLoading: loading } = useQuery({
    queryKey: ['personalTasks', user?.id],
    queryFn: () => personalTasksService.getTasks(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const tasks: PersonalTask[] = (tasksRes as any)?.data || tasksRes || [];

  // 2. Toggle Completion (Optimistic)
  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      personalTasksService.updateTask(id, { completed }),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['personalTasks', user?.id] });
      const previousTasks = queryClient.getQueryData(['personalTasks', user?.id]);
      queryClient.setQueryData(['personalTasks', user?.id], (old: any) => {
        const data = old?.data || old;
        const newTasks = data.map((t: any) => t.id === id ? { ...t, completed } : t);
        return Array.isArray(old) ? newTasks : { ...old, data: newTasks };
      });
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['personalTasks', user?.id], context?.previousTasks);
      toast.error("Failed to update task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['personalTasks', user?.id] });
    },
  });

  // 3. Delete Task (Optimistic)
  const deleteMutation = useMutation({
    mutationFn: (id: string) => personalTasksService.deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['personalTasks', user?.id] });
      const previousTasks = queryClient.getQueryData(['personalTasks', user?.id]);
      queryClient.setQueryData(['personalTasks', user?.id], (old: any) => {
        const data = old?.data || old;
        const newTasks = data.filter((t: any) => t.id !== id);
        return Array.isArray(old) ? newTasks : { ...old, data: newTasks };
      });
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['personalTasks', user?.id], context?.previousTasks);
      toast.error("Failed to delete task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['personalTasks', user?.id] });
    },
  });

  // 4. Create Task
  const createMutation = useMutation({
    mutationFn: (taskData: { title: string; deadline?: string }) => personalTasksService.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalTasks', user?.id] });
      toast.success("Task created!");
    },
  });

  // 5. Clear All
  const clearMutation = useMutation({
    mutationFn: () => personalTasksService.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalTasks', user?.id] });
      toast.success("Cleared all tasks");
    },
  });

  const parseDeadline = (deadlineStr?: string) => {
    if (!deadlineStr) return { date: "No Deadline", time: undefined };
    const dateObj = new Date(deadlineStr);
    return {
      date: dateObj.toLocaleDateString("en-GB"),
      time: dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="">
        <div className="px-4 md:px-8 py-6 md:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-card-foreground">My Task</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Track your personal task without pressure.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => clearMutation.mutate()}
              className="flex items-center gap-2 rounded-full border border-primary px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <Upload className="h-4 w-4" /> Clear All
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> New Task
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="p-4 md:p-8 mx-2 sm:mx-4 md:mx-8 mb-8 mt-2 md:mt-0 rounded-2xl bg-background">
        {loading ? (
          <div className="rounded-xl border border-dashed border-border p-8 md:p-12 text-center">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 md:p-12 text-center">
            <p className="text-muted-foreground">
              No tasks yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Section Header */}
            <h2 className="mb-4 md:mb-6 text-base md:text-lg font-bold text-card-foreground">
              Personal To-Do List
            </h2>

            {/* Tasks List */}
            <div className="space-y-3">
              {tasks.map((task) => {
                const { date, time } = parseDeadline(task.deadline);
                const isOverdue =
                  !task.completed &&
                  task.deadline &&
                  new Date(task.deadline) < new Date();

                return (
                  <div
                    key={task.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl px-4 sm:px-6 py-4 transition-all hover:shadow-sm ${isOverdue
                      ? "bg-red-500/5 border border-red-500/20"
                      : "bg-muted"
                      }`}
                  >
                    {/* Top Row (Checkbox + Content) */}
                    <div className="flex items-start sm:items-center gap-4 w-full min-w-0">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() =>
                          toggleMutation.mutate({ id: task.id, completed: !task.completed })
                        }
                        className="h-5 w-5 sm:h-6 sm:w-6 mt-1 sm:mt-0 shrink-0 cursor-pointer rounded border-2 border-primary accent-primary"
                      />

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        {/* Date and Time */}
                        <div
                          className={`mt-1 sm:mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs mb-2 ${isOverdue
                            ? "text-red-500/80 font-medium"
                            : "text-muted-foreground"
                            }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />{" "}
                            {date}
                          </span>

                          {time && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" /> {time}
                            </span>
                          )}

                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                              Overdue
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-sm font-medium break-words transition-all ${task.completed
                            ? "line-through text-muted-foreground"
                            : isOverdue
                              ? "text-red-600 dark:text-red-400"
                              : "text-card-foreground"
                            }`}
                        >
                          {task.title}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end sm:justify-start gap-3 sm:ml-auto">
                      <button
                        onClick={() => deleteMutation.mutate(task.id)}
                        className="rounded-full p-2 text-muted-foreground transition-colors bg-background hover:text-red-500"
                        title="Delete Task"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setIsEditModalOpen(true);
                        }}
                        className="rounded-full p-2 text-muted-foreground transition-colors bg-background hover:text-card-foreground"
                        title="Edit Task"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AddPersonalTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={(data: any) => createMutation.mutate(data)}
      />

      <EditPersonalTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onEditTask={(id: string, data: any) => {
          personalTasksService.updateTask(id, data).then(() => {
            queryClient.invalidateQueries({ queryKey: ['personalTasks'] });
            setIsEditModalOpen(false);
          });
        }}
      />
    </div>
  );
};

export default MyTasksPage;
