'use client'

import React, { useState } from 'react'
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react'
import { useWorkspace } from '@/libs/hooks/useWorkspace'
import api from '@/libs/api'

interface DeleteTaskModalProps {
    isOpen: boolean
    onClose: () => void
    onTaskDeleted?: () => void
    task: { id: string, name: string } | null
}

const DeleteTaskModal = ({ isOpen, onClose, onTaskDeleted, task }: DeleteTaskModalProps) => {
    const { currentWorkspace } = useWorkspace()
    const [isDeleting, setIsDeleting] = useState(false)
    const [confirmText, setConfirmText] = useState('')

    if (!isOpen || !task) return null

    const taskNameMatches = confirmText.trim() === task.name

    const handleDelete = async () => {
        if (!currentWorkspace?.id || !taskNameMatches) return

        try {
            setIsDeleting(true)
            await api.delete(`/tasks/${currentWorkspace.id}/tasks/${task.id}/`)
            onTaskDeleted?.()
            onClose()
        } catch (error) {
            console.error('Failed to delete task:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex w-full max-w-md flex-col rounded-2xl bg-card shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3 text-destructive">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold">Delete Task</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                        <div className="flex gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>
                                <strong>Warning:</strong> The task <strong className="font-bold">"{task.name}"</strong> will be permanently deleted. This action cannot be undone and will remove all associated comments and attachments.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                        <label className="text-sm font-semibold text-foreground">
                            To confirm, please type <strong className="font-bold select-all">{task.name}</strong>
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type the task name..."
                            className="rounded-xl border border-input bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-destructive focus:outline-none focus:ring-1 focus:ring-destructive"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t p-6">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="rounded-xl px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={!taskNameMatches || isDeleting}
                        className="flex items-center gap-2 rounded-xl bg-destructive px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-destructive/90 disabled:opacity-50"
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Delete Task
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteTaskModal
