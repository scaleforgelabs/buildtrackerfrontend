import { create } from "zustand";
import { Task, INITIAL_TASKS, TaskStatus } from "@/app/constants/tasks";

interface TaskStore {
  tasks: Task[];
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  initializeTasks: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: INITIAL_TASKS,

  initializeTasks: () => {
    set({ tasks: INITIAL_TASKS });
  },

  updateTaskStatus: (taskId: string, status: TaskStatus) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task,
      ),
    }));
  },
}));
