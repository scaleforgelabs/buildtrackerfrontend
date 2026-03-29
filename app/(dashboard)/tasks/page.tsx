'use client'

import React, { useState, useEffect } from 'react'
import {
  Layout,
  List,
  LayoutGrid,
  GitCommitHorizontal,
  Plus,
  Upload
} from 'lucide-react'
import dynamic from "next/dynamic";
const KanbanView = dynamic(() => import("@/app/components/tasks/views/KanbanView"), { ssr: false });
const ListView = dynamic(() => import("@/app/components/tasks/views/ListView"), { ssr: false });
const BoardView = dynamic(() => import("@/app/components/tasks/views/BoardView"), { ssr: false });
const TimelineView = dynamic(() => import("@/app/components/tasks/views/TimelineView"), { ssr: false });
const CreateTaskModal = dynamic(() => import("@/app/components/tasks/modals/CreateTaskModal"), { ssr: false });
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/libs/hooks/useWorkspace"
import { tasksService } from "@/libs/api/services"
import api from "@/libs/api"
import { useCallback } from 'react'

const TasksPage = () => {
  const queryClient = useQueryClient();
  const [currentView, setCurrentView] = useState('list')
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { currentWorkspace } = useWorkspace()

  const { data: tasksRes, isLoading: tasksLoading, refetch: fetchTasks } = useQuery({
    queryKey: ['globalTasks'],
    queryFn: () => tasksService.getTasks(),
    staleTime: 5 * 60 * 1000,
  });

  const tasks = (tasksRes as any)?.data?.results?.data || (tasksRes as any)?.data || [];

  useEffect(() => {
    setMounted(true)
  }, [])

  const tabs = [
    { id: 'kanban', label: 'Kanban', icon: Layout },
    { id: 'list', label: 'List', icon: List },
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'timeline', label: 'Timeline', icon: GitCommitHorizontal },
  ]

  const renderView = () => {
    if (!mounted || tasksLoading) return <div className="p-8 text-center text-muted-foreground">Loading tasks...</div>

    switch (currentView) {
      case 'kanban': return <KanbanView tasks={tasks} loading={tasksLoading} onTasksChange={() => queryClient.invalidateQueries({ queryKey: ['globalTasks'] })} onRefresh={() => fetchTasks()} />
      case 'list': return <ListView tasks={tasks} loading={tasksLoading} onTasksChange={() => queryClient.invalidateQueries({ queryKey: ['globalTasks'] })} />
      case 'board': return <BoardView tasks={tasks} loading={tasksLoading} onTasksChange={() => queryClient.invalidateQueries({ queryKey: ['globalTasks'] })} />
      case 'timeline': return <TimelineView tasks={tasks} loading={tasksLoading} onTasksChange={() => queryClient.invalidateQueries({ queryKey: ['globalTasks'] })} />
      default: return <ListView tasks={tasks} loading={tasksLoading} onTasksChange={() => queryClient.invalidateQueries({ queryKey: ['globalTasks'] })} />
    }
  }

  if (!mounted) {
    return (
      <div className="p-6 space-y-8 bg-muted min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-muted min-h-screen">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
          <p className="text-sm text-muted-foreground">Track and manage all your project tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground">
            <Upload className="h-4 w-4" />
            Import CSV
          </button>
          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center overflow-x-auto rounded-xl bg-card p-1 shadow-sm w-fit max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentView === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 rounded-2xl bg-card overflow-hidden">
        {renderView()}
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onTaskCreated={() => fetchTasks()}
      />
    </div>
  )
}

export default TasksPage