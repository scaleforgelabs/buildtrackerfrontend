import { Images } from "@/public"
import { StaticImageData } from "next/image";

export type TaskStatus = "Pending" | "In Progress" | "Completed";
export type TaskPriority = "High" | "Medium" | "Low";

export interface TaskData {
    id: string;
    ticket_number: number;
    task_name: string;
    status: string;
    priority: string;
    assigned_user: {
        first_name: string;
        last_name: string;
        email: string;
        avatar?: string;
    };
    start_date: string;
    end_date: string;
    comments: any[];
    attachments: any[];
    has_blocker?: boolean;
}

export interface Task {
    id: string;
    ticketNo: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    owner: {
        name: string;
        avatar: string | StaticImageData;
    };
    dueDate: string; // Used for "Date" in Kanban and "Timeline date" in List
    tags: string[]; // Can represent the counts or tags as seen in UI
    commentsCount: number;
    attachmentsCount: number;
}

export const INITIAL_TASKS: Task[] = [
    {
        id: "1",
        ticketNo: "#11",
        title: "Hope Page Wireframe",
        description: "Create a detailed wireframe for the new home page design.",
        status: "Completed",
        priority: "Medium",
        owner: {
            name: "Muaz Balogun",
            avatar: Images.user,
        },
        dueDate: "Mar 12, 2025",
        tags: ["UI/UX"],
        commentsCount: 2,
        attachmentsCount: 3,
    },
    {
        id: "2",
        ticketNo: "#10",
        title: "Hope Page Wireframe",
        description: "Refine the mobile version of the home page wireframe.",
        status: "Completed",
        priority: "Medium",
        owner: {
            name: "Muaz Balogun",
            avatar: Images.user,
        },
        dueDate: "Mar 12, 2025",
        tags: ["Mobile"],
        commentsCount: 2,
        attachmentsCount: 3,
    },
    {
        id: "3",
        ticketNo: "#09",
        title: "Darkmode Version",
        description: "Design the dark mode palette and apply it to the dashboard.",
        status: "In Progress",
        priority: "Medium",
        owner: {
            name: "Muaz Balogun",
            avatar: Images.user,
        },
        dueDate: "Mar 12, 2025",
        tags: ["Feature"],
        commentsCount: 2,
        attachmentsCount: 3,
    },
    {
        id: "4",
        ticketNo: "#08",
        title: "KPI and Employee Statistics",
        description: "Implement the backend logic for calculating team performance KPIs.",
        status: "Pending",
        priority: "Medium",
        owner: {
            name: "Muaz Balogun",
            avatar: Images.user,
        },
        dueDate: "Mar 12, 2025",
        tags: ["Backend"],
        commentsCount: 2,
        attachmentsCount: 3,
    },
    {
        id: "5",
        ticketNo: "#06",
        title: "Improve API Security",
        description: "Review and enhance authentication protocols for internal APIs.",
        status: "In Progress",
        priority: "Medium",
        owner: {
            name: "Muaz Balogun",
            avatar: Images.user,
        },
        dueDate: "Mar 12, 2025",
        tags: ["Security"],
        commentsCount: 2,
        attachmentsCount: 3,
    },
    {
        id: "6",
        ticketNo: "#07",
        title: "Hope Page Wireframe",
        description: "Finalize the desktop wireframe layout for stakeholder review.",
        status: "Completed",
        priority: "Medium",
        owner: {
            name: "Muaz Balogun",
            avatar: Images.user,
        },
        dueDate: "Mar 12, 2025",
        tags: ["Design"],
        commentsCount: 2,
        attachmentsCount: 3,
    },
    {
        id: "7",
        ticketNo: "#04",
        title: "Add Notification Icon and Profile Display to Menu Tab",
        description: "Introduce a new feature called Notifications, along with a new top navigation layout.",
        status: "Pending",
        priority: "High",
        owner: {
            name: "Muaz Balogun",
            avatar: Images.user,
        },
        dueDate: "Dec 12, 2025",
        tags: ["UI"],
        commentsCount: 2,
        attachmentsCount: 3,
    }
];
