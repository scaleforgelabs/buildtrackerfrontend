'use client'

import React, { useState, useEffect, useRef, use } from 'react'
import { getFileIcon } from '@/libs/utils'
import {
    ArrowLeft,
    Calendar,
    Paperclip,
    Trash2,
    CheckCircle2,
    User,
    Menu,
    Plus,
    X,
    Search,
    MessageSquare,
    Eye,
    AtSign,
    Smile,
    Send,
    FileText,
    AlertCircle,
    AlignLeft,
    Ban,
    MoreHorizontal,
    AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useWorkspace } from '@/libs/hooks/useWorkspace'
import api from '@/libs/api'
import UserAvatar from '@/app/components/ui/UserAvatar'
import UpdateTaskModal from '@/app/components/tasks/modals/UpdateTaskModal'
import DeleteTaskModal from '@/app/components/tasks/modals/DeleteTaskModal'
import toast from 'react-hot-toast'
import EmojiPicker from 'emoji-picker-react'
import CommentEditor from '@/app/components/ui/CommentEditor'

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const priorityStyles: Record<string, { bg: string, text: string }> = {
    high: { bg: 'bg-red-50 border border-red-200', text: 'text-red-700' },
    medium: { bg: 'bg-orange-50 border border-orange-200', text: 'text-orange-700' },
    low: { bg: 'bg-green-50 border border-green-200', text: 'text-green-700' },
}

const statusStyles: Record<string, { bg: string, text: string }> = {
    pending: { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-700' },
    in_progress: { bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700' },
    completed: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700' },
    blocked: { bg: 'bg-red-50 border border-red-200', text: 'text-red-700' },
}

const TaskDetailsPage = ({ params }: { params: Promise<{ id: string, taskId: string }> }) => {
    const resolvedParams = use(params)
    const { id: workspaceId, taskId } = resolvedParams

    const [activeTab, setActiveTab] = useState('comments')
    const [task, setTask] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { currentWorkspace } = useWorkspace()

    // Modals
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const router = useRouter()

    interface FileWithProgress extends File {
        progress?: number
    }

    // Comments State
    const [commentText, setCommentText] = useState('')
    const [submittingComment, setSubmittingComment] = useState(false)
    const [commentAttachments, setCommentAttachments] = useState<FileWithProgress[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Blockers State
    const [hasBlocker, setHasBlocker] = useState(false)
    const [blockerReason, setBlockerReason] = useState('')
    const [submittingBlocker, setSubmittingBlocker] = useState(false)

    const fetchTaskDetails = async () => {
        if (!workspaceId || !taskId) return;
        try {
            const response = await api.get(`/tasks/${workspaceId}/tasks/${taskId}/`)
            setTask(response.data)
            setHasBlocker(response.data.task?.has_blocker || false)
            setBlockerReason(response.data.task?.blocker_reason || '')
        } catch (err) {
            console.error("Failed to fetch task details:", err)
            setError("Failed to load task details. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTaskDetails()
    }, [workspaceId, taskId])

    const handlePostComment = async () => {
        if ((!commentText.trim() && commentAttachments.length === 0) || !workspaceId) return
        try {
            setSubmittingComment(true)
            const formData = new FormData()
            formData.append('comment_text', commentText)

            commentAttachments.forEach((file) => {
                formData.append('attachments', file)
            })

            await api.post(`/tasks/${workspaceId}/tasks/${taskId}/comments/`, formData)

            setCommentText('')
            setCommentAttachments([])
            fetchTaskDetails()
            toast.success("Comment posted!")
        } catch (error) {
            console.error("Failed to post comment:", error)
            toast.error("Failed to post comment.")
        } finally {
            setSubmittingComment(false)
        }
    }

    const simulateUpload = (index: number) => {
        let progress = 0
        const interval = setInterval(() => {
            progress += Math.random() * 40
            if (progress > 100) progress = 100

            setCommentAttachments(prev => {
                const updated = [...prev]
                if (updated[index]) {
                    updated[index].progress = progress
                }
                return updated
            })

            if (progress >= 100) clearInterval(interval)
        }, 300)
    }

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed, opening in new tab", error);
            window.open(url, '_blank');
        }
    };

    const handleSaveBlocker = async (customHasBlocker?: boolean, customReason?: string) => {
        const finalHasBlocker = customHasBlocker !== undefined ? customHasBlocker : hasBlocker;
        const finalReason = customReason !== undefined ? customReason : blockerReason;
        try {
            setSubmittingBlocker(true)
            await api.put(`/tasks/${workspaceId}/tasks/${taskId}/blocker/`, {
                has_blocker: finalHasBlocker,
                blocker_reason: finalReason
            })
            if (customHasBlocker !== undefined) setHasBlocker(customHasBlocker)
            if (customReason !== undefined) setBlockerReason(customReason)
            fetchTaskDetails()
            toast.success("Blocker status updated!")
        } catch (error) {
            console.error("Failed to update blocker:", error)
            toast.error("Failed to update blocker.")
        } finally {
            setSubmittingBlocker(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-6 text-muted-foreground">
                Loading task details...
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

    const formatDate = (dateString?: string, showTime: boolean = false) => {
        if (!dateString) return "-"
        const date = new Date(dateString)
        const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
        if (showTime) {
            opts.hour = "numeric"
            opts.minute = "2-digit"
        }
        return date.toLocaleDateString("en-US", opts)
    }

    const taskData = task.task || task
    const commentsList = task.comments || []
    const attachmentsList = task.attachments || taskData.attachments || []

    const priorityKey = taskData.priority?.toLowerCase() || 'medium'
    const statusKey = taskData.status?.toLowerCase() || 'pending'

    const pStyle = priorityStyles[priorityKey] || priorityStyles.medium
    const sStyle = statusStyles[statusKey] || statusStyles.pending

    return (
        <div className="mx-auto flex w-full min-h-screen flex-col gap-8 p-6 lg:p-10 bg-muted">
            {/* Header / Breadcrumb Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                    <Link href={`/${workspaceId}/tasks`} className="flex items-center hover:text-gray-700 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {currentWorkspace?.name || 'Workspace'}
                    </Link>
                    <span className="mx-1">/</span>
                    <span>Ticket {taskData.ticket_number}</span>
                    <span className="mx-1">/</span>
                    <span className="text-gray-400">Edit</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsUpdateOpen(true)}
                        className="flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        Update Task
                    </button>
                    <button
                        onClick={() => setIsDeleteOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-destructive px-5 py-2 text-sm font-semibold text-white hover:bg-destructive/90 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Main Content Area (Matches Figma's exact visual flow) */}
            <div className="flex flex-col w-full bg-white rounded-2xl p-8 lg:p-10 border border-gray-100">
                {/* Title */}
                <h1 className="text-[26px] font-bold text-gray-900 leading-tight mb-8">
                    {taskData.task_name}
                </h1>

                {/* Metadata Vertical List */}
                <div className="flex flex-col gap-5 mb-10">
                    <div className="flex items-center text-sm">
                        <div className="flex w-40 items-center gap-3 text-gray-500 font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Status
                        </div>
                        <div className={`inline-flex rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${sStyle.bg} ${sStyle.text}`}>
                            {taskData.status.replace("_", " ")}
                        </div>
                    </div>

                    <div className="flex items-center text-sm">
                        <div className="flex w-40 items-center gap-3 text-gray-500 font-medium">
                            <Calendar className="h-4 w-4" />
                            Due Date
                        </div>
                        <div className="font-semibold text-gray-900">
                            {formatDate(taskData.end_date, true)}
                        </div>
                    </div>

                    <div className="flex items-center text-sm">
                        <div className="flex w-40 items-center gap-3 text-gray-500 font-medium">
                            <User className="h-4 w-4" />
                            Assignee
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <UserAvatar
                                user={{
                                    name: task.assigned_user?.first_name || "Unassigned",
                                    avatar: task.assigned_user?.avatar
                                }}
                                size={20}
                            />
                            {task.assigned_user ? `${task.assigned_user.first_name} ${task.assigned_user.last_name || ''}` : 'Unassigned'}
                        </div>
                    </div>

                    <div className="flex items-center text-sm">
                        <div className="flex w-40 items-center gap-3 text-gray-500 font-medium">
                            <AlertCircle className="h-4 w-4" />
                            Priority level
                        </div>
                        <div className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide ${pStyle.bg} ${pStyle.text}`}>
                            {taskData.priority}
                        </div>
                    </div>

                    <div className="flex items-center text-sm">
                        <div className="flex w-40 items-center gap-3 text-gray-500 font-medium">
                            <User className="h-4 w-4" />
                            Created by
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <UserAvatar
                                user={{
                                    name: task.created_by_user?.first_name || "System",
                                    avatar: task.created_by_user?.avatar
                                }}
                                size={20}
                            />
                            {task.created_by_user ? `${task.created_by_user.first_name} ${task.created_by_user.last_name || ''}` : 'System'}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-10">
                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500">
                        <AlignLeft className="h-4 w-4" />
                        Description
                    </div>
                    <div
                        className="text-[15px] leading-relaxed text-gray-800 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: taskData.task_description || "<span class='text-gray-400 italic'>No description provided.</span>" }}
                    />
                </div>

                {/* Attachments */}
                <div className="mb-12">
                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Paperclip className="h-4 w-4" />
                        Attachments <span className="text-gray-400">({attachmentsList.length})</span>
                    </div>
                    {attachmentsList.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {attachmentsList.map((attachment: any, index: number) => {
                                const ext = attachment.file_name?.split('.').pop()?.toUpperCase() || 'FILE'
                                const isImage = ext.match(/^(JPEG|JPG|GIF|PNG|WEBP|SVG)$/i)
                                return (
                                    <div key={attachment.id || index} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex h-10 w-10 items-center justify-center shrink-0">
                                            {isImage ? (
                                                <img src={attachment.file_url || attachment.file} alt="Preview" className="h-10 w-10 object-cover rounded-lg border border-gray-100" />
                                            ) : (
                                                <img width="40" height="40" src={getFileIcon(attachment.file_name || attachment.file)} alt="File" className="object-contain" />
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate text-sm font-medium text-gray-900" title={attachment.file_name}>
                                                {attachment.file_name || attachment.file?.split('/').pop() || 'Attachment'}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                                                <span>{attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Attached file'}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <button onClick={() => handleDownload(attachment.file_url || attachment.file, attachment.file_name || 'download')} className="font-medium text-primary hover:underline transition-all">Download</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Bottom Tabs Area */}
                <div className="border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-6 border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'comments'
                                ? 'text-primary'
                                : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            Comments
                            {activeTab === 'comments' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"></span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('blockers')}
                            className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'blockers'
                                ? 'text-primary'
                                : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            Blockers
                            {activeTab === 'blockers' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"></span>}
                        </button>
                    </div>

                    <div className="mt-8">
                        {/* COMMENTS TAB */}
                        {activeTab === 'comments' && (
                            <div className="flex flex-col gap-6">
                                {/* Comment Input Box (Rich-Text Style Figma Match) */}
                                <div className="relative mb-6">
                                    <CommentEditor
                                        value={commentText}
                                        onChange={setCommentText}
                                        onAttachClick={() => fileInputRef.current?.click()}
                                        onSend={handlePostComment}
                                        isSubmitting={submittingComment}
                                        hasAttachments={commentAttachments.length > 0}
                                        placeholder="Add a comment here"
                                        attachments={commentAttachments}
                                        onRemoveAttachment={(i) => setCommentAttachments(prev => prev.filter((_, idx) => idx !== i))}
                                    />

                                    {/* Invisible File Input */}
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || [])
                                            const filesWithProgress = files.map(file => {
                                                const fw = file as FileWithProgress
                                                fw.progress = 0
                                                return fw
                                            })

                                            setCommentAttachments(prev => {
                                                const startIdx = prev.length
                                                const updated = [...prev, ...filesWithProgress]

                                                filesWithProgress.forEach((_, idx) => {
                                                    simulateUpload(startIdx + idx)
                                                })
                                                return updated
                                            })
                                            e.target.value = '';
                                        }}
                                    />
                                </div>

                                {/* Comments List */}
                                <div className="flex flex-col gap-6">
                                    {taskData.comments?.length === 0 ? (
                                        <div className="text-sm text-gray-500 italic">No comments yet.</div>
                                    ) : (
                                        taskData.comments?.map((comment: any) => (
                                            <div key={comment.id} className="flex gap-4 pb-4 pt-2">
                                                {/* Avatar */}
                                                <div className="relative h-10 w-10 flex-shrink-0">
                                                    <div className="h-full w-full overflow-hidden rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                                                        {comment.user_detail?.profile_picture ? (
                                                            <img src={comment.user_detail.profile_picture} alt={`${comment.user_detail.first_name}`} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span>{comment.user_detail?.first_name?.[0] || 'U'}</span>
                                                        )}
                                                    </div>
                                                    {/* Online Indicator Dot */}
                                                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                                                </div>
                                                <div className="flex flex-col w-full">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[13px] font-bold text-gray-900">{comment.user_detail?.first_name} {comment.user_detail?.last_name}</span>
                                                            <span className="text-[11px] text-gray-400">• {new Date(comment.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <button className="text-gray-400 hover:text-gray-600 transition-colors px-2">
                                                            <span className="text-xl leading-none tracking-tighter">...</span>
                                                        </button>
                                                    </div>
                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap mt-1 prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: comment.comment_text }} />
                                                    {/* Attachments */}
                                                    {comment.attachments && comment.attachments.length > 0 && (
                                                        <div className="mt-4 flex flex-wrap gap-4">
                                                            {comment.attachments.map((att: any) => {
                                                                const fileUrl = att.file_url || att.file || '';
                                                                const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i);
                                                                if (isImage) {
                                                                    return (
                                                                        <button type="button" onClick={() => handleDownload(fileUrl, att.file_name || 'image')} key={att.id} className="block w-full max-w-md overflow-hidden rounded-xl border-[4px] border-black hover:opacity-90 transition-opacity">
                                                                            <img src={fileUrl} alt={att.file_name || 'Attachment'} className="h-auto w-full object-cover max-h-80" />
                                                                        </button>
                                                                    )
                                                                }
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDownload(fileUrl, att.file_name || 'download')}
                                                                        key={att.id}
                                                                        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 hover:bg-gray-50 transition-colors shadow-sm min-w-[240px] max-w-sm text-left"
                                                                    >
                                                                        <img width="40" height="40" src={getFileIcon(att.file_name || att.file)} alt="File" className="object-contain shrink-0" />
                                                                        <div className="flex flex-col truncate">
                                                                            <span className="text-sm font-semibold text-gray-900 truncate">{att.file_name || 'Document'}</span>
                                                                            <span className="text-xs font-semibold text-gray-500 mt-0.5">{formatBytes(att.file_size || 0)} • Download</span>
                                                                        </div>
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* BLOCKERS TAB */}
                        {activeTab === 'blockers' && (
                            <div className="flex w-full flex-col">
                                {!taskData.has_blocker ? (
                                    <div className="flex flex-col gap-6 max-w-2xl">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-4">Blocker Status</h3>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={hasBlocker}
                                                    onChange={(e) => setHasBlocker(e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                />
                                                <span className="text-sm font-medium text-gray-900">Task has a blocker</span>
                                            </label>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <label className="text-sm text-gray-500 font-medium">Describe the blocker if there is one...</label>
                                            <textarea
                                                value={blockerReason}
                                                onChange={(e) => setBlockerReason(e.target.value)}
                                                disabled={!hasBlocker}
                                                className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50 min-h-[140px]"
                                            />
                                        </div>
                                        <div className="flex gap-3 justify-end mt-2">
                                            <button
                                                onClick={() => {
                                                    setHasBlocker(taskData.has_blocker || false)
                                                    setBlockerReason(taskData.blocker_reason || '')
                                                }}
                                                className="rounded-lg px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleSaveBlocker()}
                                                disabled={submittingBlocker || (!hasBlocker && !taskData.has_blocker)}
                                                className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                            >
                                                {submittingBlocker ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Blocker Read-Only Overview Map (Figma Match) */
                                    <div className="w-full max-w-2xl mt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                                <Ban className="h-5 w-5 text-red-500" />
                                                Blocker Overview
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="relative flex items-center justify-between rounded-xl border border-red-200 bg-[#FFF5F5] p-5">
                                            {/* Left red indicator line */}
                                            <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-md bg-red-500"></div>

                                            <div className="flex flex-col gap-1.5 pl-4">
                                                <span className="text-[15px] font-bold text-gray-900">
                                                    {taskData.task_name}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                    <span>{taskData.blocker_reason || "No edit task page deployed originally"}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleSaveBlocker(false, '')}
                                                disabled={submittingBlocker}
                                                className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-400 bg-transparent hover:bg-black/5 transition-colors focus:outline-none disabled:opacity-50"
                                                title="Resolve Blocker"
                                            >
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <UpdateTaskModal
                isOpen={isUpdateOpen}
                onClose={() => setIsUpdateOpen(false)}
                onTaskUpdated={fetchTaskDetails}
                task={taskData}
            />

            <DeleteTaskModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onTaskDeleted={() => router.push(`/${workspaceId}/tasks`)}
                task={{ id: taskData.id, name: taskData.task_name }}
            />
        </div>
    )
}

export default TaskDetailsPage
