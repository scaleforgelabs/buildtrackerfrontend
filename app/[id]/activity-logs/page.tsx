"use client";

import {
    Download,
    ChevronDown,
    Plus,
    Trash2,
    MessageSquare,
    RefreshCw,
    UserPlus,
} from "lucide-react";
import Image from "next/image";
import { Images } from "@/public";
import UserAvatar from "@/app/components/ui/UserAvatar";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { useEffect, useState } from "react";
import api from "@/libs/api";

interface Log {
    id: string;
    log_type: string;
    severity: string;
    action: string;
    entity_type: string;
    entity_id: string;
    description: string;
    metadata: Record<string, any>;
    user_email: string;
    user_name: string;
    ip_address: string;
    created_at: string;
}

const getEventIcon = (logType: string) => {
    switch (logType) {
        case "task_create":
            return <Plus className="h-4 w-4 text-blue-500" />;
        case "task_delete":
            return <Trash2 className="h-4 w-4 text-red-500" />;
        case "task_update":
            return <RefreshCw className="h-4 w-4 text-blue-500" />;
        case "comment_create":
            return <MessageSquare className="h-4 w-4 text-blue-500" />;
        case "member_add":
            return <UserPlus className="h-4 w-4 text-green-500" />;
        default:
            return <Plus className="h-4 w-4 text-blue-500" />;
    }
};

const getEventName = (logType: string) => {
    const eventMap: Record<string, string> = {
        task_create: "Task Created",
        task_delete: "Task Deleted",
        task_update: "Task Updated",
        comment_create: "Comment Added",
        comment_delete: "Comment Deleted",
        member_add: "Member Added",
        member_remove: "Member Removed",
    };
    return eventMap[logType] || logType;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function ActivityLogsPage() {
    const { currentWorkspace } = useWorkspace();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentWorkspace?.id) return;

        const fetchLogs = async () => {
            try {
                setLoading(true);
                const response = await api.get(
                    `/logs/workspaces/${currentWorkspace.id}/logs/detailed`
                );
                setLogs(response.data.data || []);
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [currentWorkspace?.id]);

    return (
        <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-2">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                        Activity Logs - {currentWorkspace?.name || "Loading..."}
                    </h1>
                    <p className="text-sm md:text-md text-muted-foreground mt-1">
                        Track all your workspace activities and changes
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                        All Activities
                        <ChevronDown className="h-4 w-4" />
                    </button>
                    <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all">
                        <Download className="h-5 w-5" />
                        Export
                    </button>
                </div>
            </div>

            {/* Main Content Table Area */}
            <div className="rounded-[2.5rem] bg-card p-4 md:p-8 border border-border shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted rounded-2xl overflow-hidden">
                                <th className="px-4 first:rounded-l-2xl">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded-md border-border text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">
                                    User
                                </th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">
                                    Event
                                </th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">
                                    Type
                                </th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">
                                    Description
                                </th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground last:rounded-r-2xl">
                                    Timeline date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No activity logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded-md border-border text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar
                                                    user={{
                                                        name: log.user_name,
                                                        email: log.user_email,
                                                        avatar: (log as any).user_avatar || "" // No avatar in logs response yet, use initials
                                                    }}
                                                    size={40}
                                                    className="h-10 w-10 border border-border"
                                                />
                                                <div>
                                                    <span className="font-semibold text-foreground block">
                                                        {log.user_name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.user_email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg border border-border bg-white group-hover:bg-blue-50 transition-colors">
                                                    {getEventIcon(log.log_type)}
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {getEventName(log.log_type)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                                {log.entity_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                                {log.description}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-foreground whitespace-nowrap">
                                                {formatDate(log.created_at)}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        Showing <span className="text-foreground">1 to {logs.length}</span> of{" "}
                        <span className="text-foreground">{logs.length} logs</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <button className="px-6 py-2.5 rounded-xl border border-border bg-white text-sm font-bold text-foreground hover:bg-muted disabled:opacity-50 transition-colors" disabled>
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm font-bold bg-muted rounded-xl border border-border">
                            1 of 1
                        </span>
                        <button className="px-6 py-2.5 rounded-xl border border-border bg-white text-sm font-bold text-foreground hover:bg-muted transition-colors" disabled>
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
