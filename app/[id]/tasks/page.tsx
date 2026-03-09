'use client'

import React, { useState, useEffect } from 'react'
import {
  Layout,
  List,
  LayoutGrid,
  Calendar,
  GitCommitHorizontal,
  GanttChart,
  Plus,
  Upload
} from 'lucide-react'
import KanbanView from '@/app/components/tasks/views/KanbanView'
import ListView from '@/app/components/tasks/views/ListView'
import BoardView from '@/app/components/tasks/views/BoardView'
import CalendarView from '@/app/components/tasks/views/CalendarView'
import TimelineView from '@/app/components/tasks/views/TimelineView'
import GanttView from '@/app/components/tasks/views/GanttView'
import CreateTaskModal from '@/app/components/tasks/modals/CreateTaskModal'
import { useWorkspace } from '@/libs/hooks/useWorkspace'
import Papa from 'papaparse'
import { tasksService } from '@/libs/api/services'
import { useRef } from 'react'

const TasksPage = () => {
  const [currentView, setCurrentView] = useState('list')
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { currentWorkspace } = useWorkspace()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleImportClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentWorkspace) return

    setIsImporting(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[]

          for (const row of rows) {
            // Map CSV columns to generic task model. 
            // Required backend fields: title, description, display_id (auto generated usually), priority, status
            const taskPayload = {
              workspace: currentWorkspace.id,
              title: row.Title || row.title || row.Name || row.name || 'Imported Task',
              description: row.Description || row.description || '',
              status: row.Status || row.status || 'pending',
              priority: row.Priority || row.priority || 'medium',
            }

            await tasksService.createTask(taskPayload)
          }

          // Reset and refresh
          if (fileInputRef.current) fileInputRef.current.value = ''
          window.location.reload()

        } catch (error) {
          console.error("Failed to import tasks:", error)
          alert("Failed to import some tasks. Please check the CSV format.")
        } finally {
          setIsImporting(false)
        }
      },
      error: (error) => {
        console.error("CSV Parse Error:", error)
        setIsImporting(false)
        alert("Failed to parse CSV file.")
      }
    })
  }

  const tabs = [
    { id: 'kanban', label: 'Kanban', icon: Layout },
    { id: 'list', label: 'List', icon: List },
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'timeline', label: 'Timeline', icon: GitCommitHorizontal },
    { id: 'gantt', label: 'Gantt', icon: GanttChart },
  ]

  const renderView = () => {
    if (!mounted) return <div>Loading...</div>

    switch (currentView) {
      case 'kanban': return <KanbanView />
      case 'list': return <ListView />
      case 'board': return <BoardView />
      case 'calendar': return <CalendarView />
      case 'timeline': return <TimelineView />
      case 'gantt': return <GanttView />
      default: return <ListView />
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
          <h1 className="text-2xl font-bold text-foreground">Tasks - {currentWorkspace?.name || 'Loading...'}</h1>
          <p className="text-sm text-muted-foreground">Track and manage all your project tasks</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(currentWorkspace?.user_role === 'Owner' || currentWorkspace?.user_role === 'Admin') && (
            <>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? 'Importing...' : 'Import CSV'}
              </button>
            </>
          )}
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
        onTaskCreated={() => window.location.reload()}
      />
    </div>
  )
}

export default TasksPage