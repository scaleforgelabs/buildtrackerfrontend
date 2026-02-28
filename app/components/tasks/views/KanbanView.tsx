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

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

import { Task, TaskStatus } from "@/app/constants/tasks";
import { TaskCard } from "../TaskCard";
import { useTaskStore } from "@/app/store/taskStore";

// -------------------- Types --------------------
type ColumnId = "pending" | "inProgress" | "completed";

const statusMapping: Record<ColumnId, TaskStatus> = {
  pending: "Pending",
  inProgress: "In Progress",
  completed: "Completed",
};

const reverseStatusMapping: Record<TaskStatus, ColumnId> = {
  Pending: "pending",
  "In Progress": "inProgress",
  Completed: "completed",
};

// -------------------- Initial Data mapping --------------------
const getInitialData = (tasks: Task[]): Record<ColumnId, Task[]> => {
  const data: Record<ColumnId, Task[]> = {
    pending: [],
    inProgress: [],
    completed: [],
  };

  tasks.forEach((task) => {
    const colId = reverseStatusMapping[task.status];
    data[colId].push(task);
  });

  return data;
};

// -------------------- Sortable Card --------------------
function SortableTicket({ ticket }: { ticket: Task }) {
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
      <TaskCard task={ticket} />
    </div>
  );
}

// -------------------- Column --------------------
function KanbanColumn({
  title,
  icon: Icon,
  columnId,
  items,
}: {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  columnId: ColumnId;
  items: Task[];
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

// -------------------- Board --------------------
export default function KanbanBoard() {
  const { tasks, updateTaskStatus } = useTaskStore();
  const [columns, setColumns] = useState(getInitialData(tasks));
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync columns when tasks change from store
  useEffect(() => {
    setColumns(getInitialData(tasks));
  }, [tasks]);

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

  function findTicketById(id: string): Task | undefined {
    for (const col of Object.keys(columns) as ColumnId[]) {
      const ticket = columns[col].find((t) => t.id === id);
      if (ticket) return ticket;
    }
    return undefined;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
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

      // Update task status in store and local columns
      const updatedTask = { ...moved, status: statusMapping[targetCol] };
      updateTaskStatus(activeId, statusMapping[targetCol]);

      setColumns({
        ...columns,
        [sourceCol]: sourceItems,
        [targetCol]: [updatedTask, ...targetItems],
      });
    }
  }

  const activeTicket = activeId ? findTicketById(activeId) : null;

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
          columnId="inProgress"
          items={columns.inProgress}
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
            <TaskCard task={activeTicket} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
