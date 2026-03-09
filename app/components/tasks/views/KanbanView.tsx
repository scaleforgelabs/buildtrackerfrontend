"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/app/components/ui/button";
import { Plus, CheckCircle2, Loader2, Clock } from "lucide-react";
import { TaskCard } from "../TaskCard";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { useRouter } from "next/navigation";
import api from "@/libs/api";

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

type ColumnId = "pending" | "in_progress" | "completed";

interface TaskData {
  id: string;
  ticket_number: number;
  task_name: string;
  status: string;
  priority: string;
  assigned_user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  start_date: string;
  end_date: string;
  comments: any[];
  attachments: any[];
}

const statusMapping: Record<ColumnId, string> = {
  pending: "pending",
  in_progress: "in_progress",
  completed: "completed",
};

const reverseStatusMapping: Record<string, ColumnId> = {
  pending: "pending",
  in_progress: "in_progress",
  completed: "completed",
};

const getInitialData = (tasks: TaskData[]): Record<ColumnId, TaskData[]> => {
  const data: Record<ColumnId, TaskData[]> = {
    pending: [],
    in_progress: [],
    completed: [],
  };

  tasks.forEach((task) => {
    const colId = reverseStatusMapping[task.status] || "pending";
    data[colId].push(task);
  });

  return data;
};

function SortableTicket({ ticket }: { ticket: TaskData }) {
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard
        task={ticket as any}
        onClick={() => {
          if (currentWorkspace?.id) {
            router.push(`/${currentWorkspace.id}/tasks/${ticket.id}`);
          }
        }}
      />
    </div>
  );
}

function KanbanColumn({
  title,
  icon: Icon,
  columnId,
  items,
}: {
  title: string;
  icon: any;
  columnId: ColumnId;
  items: TaskData[];
}) {
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <div className="flex flex-col bg-white dark:bg-muted/10 rounded-2xl p-4 w-full min-w-[320px] md:min-w-0 h-fit border border-border">
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2 font-bold text-foreground text-base">
          <Icon className="h-5 w-5 text-primary" />
          {title}
          <span className="text-muted-foreground font-medium ml-1 text-sm">
            ({items.length})
          </span>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div ref={setNodeRef} className="flex-1 pr-1">
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-5">
            {items.map((item) => (
              <SortableTicket key={item.id} ticket={item} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const { currentWorkspace } = useWorkspace();
  const [columns, setColumns] = useState<Record<ColumnId, TaskData[]>>({
    pending: [],
    in_progress: [],
    completed: [],
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace?.id) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/tasks/${currentWorkspace.id}/tasks/?_t=${Date.now()}`);
        const tasks = response.data.results?.data || [];
        setColumns(getInitialData(tasks));
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentWorkspace?.id]);



  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  function findColumnByTicket(id: string): ColumnId | null {
    return (
      (Object.keys(columns) as ColumnId[]).find((col) =>
        columns[col].some((t) => t.id === id),
      ) ?? null
    );
  }

  function findTicketById(id: string): TaskData | undefined {
    for (const col of Object.keys(columns) as ColumnId[]) {
      const ticket = columns[col].find((t) => t.id === id);
      if (ticket) return ticket;
    }
    return undefined;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceCol = findColumnByTicket(activeId);
    const targetCol = (Object.keys(columns) as ColumnId[]).includes(
      overId as ColumnId,
    )
      ? (overId as ColumnId)
      : findColumnByTicket(overId);

    if (!sourceCol || !targetCol) return;

    if (sourceCol === targetCol) {
      const items = columns[sourceCol];
      const oldIndex = items.findIndex((i) => i.id === activeId);
      const newIndex = items.findIndex((i) => i.id === overId);

      setColumns({
        ...columns,
        [sourceCol]: arrayMove(items, oldIndex, newIndex),
      });
    } else {
      const sourceItems = [...columns[sourceCol]];
      const targetItems = [...columns[targetCol]];

      const index = sourceItems.findIndex((i) => i.id === activeId);
      const [moved] = sourceItems.splice(index, 1);

      const updatedTask = { ...moved, status: statusMapping[targetCol] };

      // OPTIMISTIC UPDATE: Update UI immediately
      setColumns({
        ...columns,
        [sourceCol]: sourceItems,
        [targetCol]: [updatedTask, ...targetItems],
      });

      try {
        await api.put(
          `/tasks/${currentWorkspace?.id}/tasks/${activeId}/status/`,
          {
            status: statusMapping[targetCol],
            percent_complete: targetCol === 'completed' ? 100 : 0,
          }
        );
      } catch (error) {
        console.error("Failed to update task status:", error);
        // REVERT: If API fails, put it back (simplified revert)
        setColumns(columns);
      }
    }
  }

  const activeTicket = activeId ? findTicketById(activeId) : null;

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading tasks...</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-thin p-6 bg-muted">
        <KanbanColumn
          title="Pending"
          icon={Loader2}
          columnId="pending"
          items={columns.pending}
        />
        <KanbanColumn
          title="In Progress"
          icon={Clock}
          columnId="in_progress"
          items={columns.in_progress}
        />
        <KanbanColumn
          title="Completed"
          icon={CheckCircle2}
          columnId="completed"
          items={columns.completed}
        />
      </div>
      <DragOverlay>
        {activeTicket ? (
          <div className="cursor-grabbing rotate-2 scale-105 transition-transform">
            <TaskCard task={activeTicket as any} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
