"use client";

import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface AddPersonalTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: { title: string; deadline?: string }) => void;
}

const AddPersonalTaskModal: React.FC<AddPersonalTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
}) => {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask({
        title: title.trim(),
        deadline: deadline || undefined,
      });
      setTitle("");
      setDeadline("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-[var(--card)]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--card-foreground)]">
            Add new task
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--card-foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-semibold text-[var(--card-foreground)] mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Design my task page - BuildTracker"
              className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--card-foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 dark:bg-[var(--card)]"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-[var(--card-foreground)] mb-2">
              Deadline (optional)
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--muted-foreground)]" />
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="flex-1 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--card-foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 dark:bg-[var(--card)]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPersonalTaskModal;
