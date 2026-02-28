"use client";

import React, { useState } from "react";
import { Trash2, MoreVertical, Plus, Calendar, Clock, ArrowUp, Upload, MoreHorizontal } from "lucide-react";
import AddPersonalTaskModal from "@/app/components/modals/AddPersonalTaskModal";

interface PersonalTask {
  id: string;
  title: string;
  date: string;
  time?: string;
  completed: boolean;
}

const MyTasksPage = () => {
  const [tasks, setTasks] = useState<PersonalTask[]>([
    {
      id: "1",
      title: "Design My Task page - BuildTracker Project",
      date: "Today",
      time: "4:00 PM",
      completed: false,
    },
    {
      id: "2",
      title: "Design My Task page - BuildTracker Project",
      date: "Today",
      time: "2:00 PM",
      completed: false,
    },
    {
      id: "3",
      title: "Design My Task page - BuildTracker Project",
      date: "18/02/2026",
      completed: false,
    },
    {
      id: "4",
      title: "Design My Task page - BuildTracker Project",
      date: "10/02/2026",
      completed: false,
    },
    {
      id: "5",
      title: "Design My Task page - BuildTracker Project",
      date: "14/02/2026",
      time: "12:00 PM",
      completed: false,
    },
    {
      id: "6",
      title: "Design My Task page - BuildTracker Project",
      date: "13/02/2026",
      time: "4:00 PM",
      completed: false,
    },
    {
      id: "7",
      title: "Design My Task page - BuildTracker Project",
      date: "12/02/2026",
      time: "4:00 PM",
      completed: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTask = (taskData: { title: string; deadline?: string }) => {
    const newTask: PersonalTask = {
      id: Date.now().toString(),
      title: taskData.title,
      date: taskData.deadline
        ? new Date(taskData.deadline).toLocaleDateString("en-GB")
        : "Today",
      time: taskData.deadline
        ? new Date(taskData.deadline).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
      completed: false,
    };
    setTasks([newTask, ...tasks]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleToggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleClearAll = () => {
    setTasks([]);
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="">
        <div className="px-8 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-card-foreground">
              My Task
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Track your personal task without pressure.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 rounded-full border border-primary px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <Upload className="h-4 w-4"/> Clear All
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
      <div className="p-8 m-8 rounded-2xl bg-background ">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">
              No tasks yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Section Header */}
            <h2 className="mb-6 text-lg font-bold text-card-foreground">
              Personal To-Do List
            </h2>

            {/* Tasks List */}
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 rounded-xl bg-muted  px-6 py-4 transition-all hover:shadow-sm"
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTaskCompletion(task.id)}
                    className="h-6 w-6 cursor-pointer rounded border-2 border-primary accent-primary"
                  />

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    {/* Date and Time */}
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" /> {task.date}
                      </span>
                      {task.time && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" /> {task.time}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm font-medium transition-all ${
                        task.completed
                          ? "line-through text-muted-foreground"
                          : "text-card-foreground"
                      }`}
                    >
                      {task.title}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button className="rounded-full p-2 text-muted-foreground transition-colors bg-background  hover:text-card-foreground">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AddPersonalTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default MyTasksPage;
