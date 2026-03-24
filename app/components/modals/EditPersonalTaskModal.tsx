"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";

interface EditPersonalTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: { id: string; title: string; deadline?: string } | null;
    onEditTask: (id: string, updatedData: { title: string; deadline?: string }) => void;
}

const EditPersonalTaskModal: React.FC<EditPersonalTaskModalProps> = ({
    isOpen,
    onClose,
    task,
    onEditTask,
}) => {
    const [title, setTitle] = useState(task?.title || "");
    const [deadline, setDeadline] = useState(task?.deadline || "");

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            // Format deadline for datetime-local input
            if (task.deadline) {
                const d = new Date(task.deadline);
                // datetime-local format is YYYY-MM-DDThh:mm
                const tzOffset = d.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
                setDeadline(localISOTime);
            } else {
                setDeadline("");
            }
        }
    }, [task]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && task) {
            onEditTask(task.id, {
                title: title.trim(),
                deadline: deadline || undefined,
            });
            onClose();
        }
    };

    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-[var(--card)]">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--card-foreground)]">
                        Edit task
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
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPersonalTaskModal;
