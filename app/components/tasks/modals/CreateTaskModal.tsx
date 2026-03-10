'use client'

import React, { useState, useEffect } from 'react'
import {
    X,
    ListChecks,
    Calendar as CalendarIcon,
    Loader2,
} from 'lucide-react'
import TiptapEditor from "@/app/components/ui/tiptap-editor"
import { Calendar } from "@/app/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/components/ui/popover"
import UploadFile from '../../ui/UploadFIle'
import { useWorkspace } from '@/libs/hooks/useWorkspace'
import api from '@/libs/api'

interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void
    onTaskCreated?: () => void
}

interface Member {
    id: string
    user: {
        id: string
        first_name: string
        last_name: string
        email: string
    }
    role: string
    job_role?: string
}

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) => {
    const { currentWorkspace } = useWorkspace()
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        task_name: '',
        task_description: '',
        assigned_to: '',
        priority: 'medium',
        start_date: '',
        end_date: '',
        percent_complete: 0,
        attachments: [] as File[],
    })

    useEffect(() => {
        if (!isOpen || !currentWorkspace?.id) return

        const fetchMembers = async () => {
            try {
                setLoading(true)
                const response = await api.get(`/workspaces/${currentWorkspace.id}/members/`)
                setMembers(response.data.results?.data || [])
            } catch (error) {
                console.error('Failed to fetch members:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchMembers()
    }, [isOpen, currentWorkspace?.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentWorkspace?.id) return

        try {
            setSubmitting(true)
            const formDataToSend = new FormData()
            formDataToSend.append('task_name', formData.task_name)
            formDataToSend.append('task_description', formData.task_description)
            if (formData.assigned_to) formDataToSend.append('assigned_to', formData.assigned_to)
            formDataToSend.append('priority', formData.priority)
            if (formData.start_date) formDataToSend.append('start_date', formData.start_date)
            if (formData.end_date) formDataToSend.append('end_date', formData.end_date)
            formDataToSend.append('percent_complete', formData.percent_complete.toString())

            formData.attachments.forEach((file) => {
                formDataToSend.append('attachments', file)
            })

            await api.post(`/tasks/${currentWorkspace.id}/tasks/`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setFormData({
                task_name: '',
                task_description: '',
                assigned_to: '',
                priority: 'medium',
                start_date: '',
                end_date: '',
                percent_complete: 0,
                attachments: [],
            })
            onTaskCreated?.()
            onClose()
        } catch (error) {
            console.error('Failed to create task:', error)
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-card shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ListChecks className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Create New Task</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex flex-col gap-6">
                        {/* Task Title */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-foreground">Task Title</label>
                            <input
                                type="text"
                                placeholder="New Task"
                                value={formData.task_name}
                                onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                                className="rounded-xl border border-input bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        {/* Row: Priority & Assigned Member */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-foreground">Priority Level</label>
                                <div className="relative">
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full appearance-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                                        <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                                    </div>
                                    <style jsx>{`select { padding-left: 2.5rem; }`}</style>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-foreground">Assigned Member</label>
                                <div className="relative">
                                    <select
                                        value={formData.assigned_to}
                                        onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                        disabled={loading}
                                        className="w-full appearance-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                                    >
                                        <option value="">Unassigned</option>
                                        {members.map((member) => (
                                            <option key={member.id} value={member.user.id}>
                                                {member.user.first_name} {member.user.last_name} • {member.role} {member.job_role && `(${member.job_role})`}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-foreground">Description</label>
                            <TiptapEditor
                                value={formData.task_description}
                                onChange={(val) => setFormData({ ...formData, task_description: val })}
                                placeholder="Describe the task..."
                            />
                        </div>

                        {/* Timeline */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-foreground">Timeline</label>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Start Date */}
                                <div className="flex items-center gap-3">
                                    <span className="w-12 text-xs font-medium text-muted-foreground">START:</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="flex flex-1 items-center justify-between rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50">
                                                <span>{formData.start_date || 'Select Date'}</span>
                                                <CalendarIcon className="h-4 w-4 opacity-50" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.start_date ? new Date(formData.start_date) : undefined}
                                                onSelect={(date) => setFormData({ ...formData, start_date: date?.toISOString().split('T')[0] || '' })}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Due Date */}
                                <div className="flex items-center gap-3">
                                    <span className="w-12 text-xs font-medium text-muted-foreground">DUE:</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="flex flex-1 items-center justify-between rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50">
                                                <span>{formData.end_date || 'Select Date'}</span>
                                                <CalendarIcon className="h-4 w-4 opacity-50" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.end_date ? new Date(formData.end_date) : undefined}
                                                onSelect={(date) => setFormData({ ...formData, end_date: date?.toISOString().split('T')[0] || '' })}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                        <UploadFile onFilesChange={(files) => setFormData({ ...formData, attachments: files })} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t p-6">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-xl px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !formData.task_name}
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                    >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Create Task
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateTaskModal
