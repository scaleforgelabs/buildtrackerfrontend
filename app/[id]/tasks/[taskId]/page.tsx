'use client'

import React, { useState, useEffect, use } from 'react'
import {
    ArrowLeft,
    Calendar,
    User,
    AlignLeft,
    Paperclip,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
    MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useWorkspace } from '@/libs/hooks/useWorkspace'
import api from '@/libs/api'
import UserAvatar from '@/app/components/ui/UserAvatar'

// Priority styling
const priorityStyles: Record<string, { bg: string, dot: string, text: string }> = {
    high: { bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', text: 'text-red-700' },
    medium: { bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500', text: 'text-orange-700' },
    low: { bg: 'bg-green-50 border-green-200', dot: 'bg-green-500', text: 'text-green-700' },
}

// Status styling
const statusStyles: Record<string, { bg: string, dot: string, text: string }> = {
    pending: { bg: 'bg-slate-50 border-slate-200', dot: 'bg-slate-500', text: 'text-slate-700' },
    in_progress: { bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700' },
    completed: { bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    blocked: { bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', text: 'text-red-700' },
}

const TaskDetailsPage = ({ params }: { params: Promise<{ id: string, taskId: string }> }) => {
    const resolvedParams = use(params)
    const { id: workspaceId, taskId } = resolvedParams

    const [activeTab, setActiveTab] = useState('comments')
    const [task, setTask] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { currentWorkspace } = useWorkspace()

    useEffect(() => {
        if (!workspaceId || !taskId) return;

        const fetchTaskDetails = async () => {
            try {
                setLoading(true)
                const response = await api.get(`/tasks/${workspaceId}/tasks/${taskId}/`)
                setTask(response.data)
                console.log("Task data fetched:", response.data)
            } catch (err) {
                console.error("Failed to fetch task details:", err)
                setError("Failed to load task details. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchTaskDetails()
    }, [workspaceId, taskId])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <div className="text-muted-foreground animate-pulse">Loading task details...</div>
            </div>
        )
    }

    if (error || !task) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
                <div className="text-destructive font-medium">{error || "Task not found"}</div>
                <Link href={`/${workspaceId}/tasks`} className="text-primary hover:underline">
                    Return to Tasks
                </Link>
            </div>
        )
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "No date set"
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric"
        })
    }

    // Fallbacks for data structures based on API response
    const taskData = task.task || task
    const commentsList = task.comments || []
    const attachmentsList = task.attachments || taskData.attachments || []

    const priorityKey = taskData.priority?.toLowerCase() || 'medium'
    const statusKey = taskData.status?.toLowerCase() || 'pending'

    const pStyle = priorityStyles[priorityKey] || priorityStyles.medium
    const sStyle = statusStyles[statusKey] || statusStyles.pending

    return (
        <div className="flex h-full flex-col gap-6 p-6">
            {/* Breadcrumb & Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/${workspaceId}/tasks`} className="rounded-full p-2 hover:bg-gray-100">
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Link>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <span className="truncate max-w-[150px]">{currentWorkspace?.name || 'Workspace'}</span>
                        <span className="mx-2">/</span>
                        <span>Ticket {taskData.ticket_number}</span>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Details</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground">
                        <Edit className="h-4 w-4" />
                        Update Task
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="flex-1 overflow-auto rounded-3xl bg-card p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-foreground">{taskData.task_name}</h1>

                {/* Meta Data Grid */}
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-opacity-20 ${sStyle.bg}`}>
                            <div className={`h-2.5 w-2.5 rounded-full ${sStyle.dot}`}></div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <div className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${sStyle.bg} ${sStyle.text}`}>
                                {taskData.status.charAt(0).toUpperCase() + taskData.status.slice(1).replace("_", " ")}
                            </div>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Due Date</p>
                            <p className="mt-1 text-sm font-medium text-foreground">{formatDate(taskData.end_date)}</p>
                        </div>
                    </div>

                    {/* Assignee */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted overflow-hidden">
                            <UserAvatar
                                user={{
                                    name: task.assigned_user?.first_name || "Unassigned",
                                    avatar: task.assigned_user?.avatar
                                }}
                                size={32}
                            />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Assignee</p>
                            <div className="mt-1 flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground">
                                    {task.assigned_user ? `${task.assigned_user.first_name} ${task.assigned_user.last_name || ''}` : 'Unassigned'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-opacity-20 ${pStyle.bg}`}>
                            <div className={`h-2.5 w-2.5 rounded-full ${pStyle.dot}`}></div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Priority Level</p>
                            <div className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${pStyle.bg} ${pStyle.text}`}>
                                {taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)}
                            </div>
                        </div>
                    </div>

                    {/* Created By */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted overflow-hidden">
                            <UserAvatar
                                user={{
                                    name: task.created_by_user?.first_name || "System",
                                    avatar: task.created_by_user?.avatar
                                }}
                                size={32}
                            />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Created by</p>
                            <div className="mt-1 flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground">
                                    {task.created_by_user ? `${task.created_by_user.first_name} ${task.created_by_user.last_name || ''}` : 'System'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-8">
                    <div className="mb-4 flex items-center gap-2">
                        <AlignLeft className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Description</span>
                    </div>
                    <div className="rounded-xl border bg-muted/30 p-6 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {taskData.task_description || "No description provided."}
                    </div>
                </div>

                {/* Attachments */}
                <div className="mt-8">
                    <div className="mb-4 flex items-center gap-2">
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Attachments ({attachmentsList.length})</span>
                    </div>
                    {attachmentsList.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {attachmentsList.map((attachment: any, index: number) => {
                                // Extract file extension for icon generic styling
                                const ext = attachment.file_name?.split('.').pop()?.toUpperCase() || 'FILE'
                                return (
                                    <div key={attachment.id || index} className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:bg-muted/50">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <span className="text-[10px] font-bold">{ext.slice(0, 4)}</span>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate text-sm font-medium text-foreground" title={attachment.file_name}>
                                                {attachment.file_name || attachment.file?.split('/').pop() || 'Attachment'}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                <span>{attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Attached file'}</span>
                                                <span>•</span>
                                                <a href={attachment.file} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">View</a>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground italic">No attachments for this task.</div>
                    )}
                </div>

                {/* Footer Tabs */}
                <div className="mt-12 border-b">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={`border-b-2 pb-4 text-sm font-medium transition-colors ${activeTab === 'comments'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Comments <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">{commentsList.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('blockers')}
                            className={`border-b-2 pb-4 text-sm font-medium transition-colors ${activeTab === 'blockers'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Blockers
                        </button>
                        <button
                            onClick={() => setActiveTab('subtasks')}
                            className={`border-b-2 pb-4 text-sm font-medium transition-colors ${activeTab === 'subtasks'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Sub Tasks <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">0</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default TaskDetailsPage
