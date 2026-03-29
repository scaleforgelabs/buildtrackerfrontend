"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Check, Loader2 } from "lucide-react";
import { Images } from "@/public";
import { notificationsService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    Select, 
    SelectContent, 
    SelectGroup, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/app/components/ui/Select";

interface Notification {
    id: string;
    user: string;
    workspace: string;
    action: string;
    description: string;
    note_type: string;
    severity: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
    read_at: string | null;
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

function getSeverityColor(severity: string): string {
    switch (severity) {
        case 'error': return 'bg-red-600';
        case 'warning': return 'bg-yellow-600';
        case 'success': return 'bg-green-600';
        case 'info':
        default: return 'bg-blue-600';
    }
}

export default function NotificationsPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("all");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { currentWorkspace } = useWorkspace();

    // Reset page when tab, workspace, or page size changes
    useEffect(() => {
        setPage(1);
    }, [activeTab, currentWorkspace?.id, pageSize]);

    // 1. Fetch Notifications
    const { data: notificationsRes, isLoading: loading, error: queryError } = useQuery({
        queryKey: ['notifications', activeTab, currentWorkspace?.id, page, pageSize],
        queryFn: () => activeTab === "all"
            ? notificationsService.getNotifications({ Page: page, PageSize: pageSize })
            : currentWorkspace
                ? notificationsService.getWorkspaceNotifications(currentWorkspace.id, { Page: page, PageSize: pageSize })
                : notificationsService.getNotifications({ Page: page, PageSize: pageSize }),
        refetchInterval: 60000, // Poll every minute
    });

    const notifications: Notification[] = (notificationsRes as any)?.data?.results?.data || (notificationsRes as any)?.data?.data || (notificationsRes as any)?.data || [];
    const pagination = (notificationsRes as any)?.data?.results?.pagination || (notificationsRes as any)?.data?.pagination || { page: 1, total_pages: 1, total_count: 0, page_size: 20 };
    
    // We already have unread counts from the response in some cases, 
    // but calculating from the current page works for showing tab badges if we aren't using a separate unread-count API.
    // However, for total counts, the backend provides pagination.total_count.
    const unreadCount = notifications.filter(n => !n.is_read).length;
    const workspaceUnreadCount = notifications.filter(n => !n.is_read && n.workspace === currentWorkspace?.id).length;

    // 2. Mark All Read
    const markAllReadMutation = useMutation({
        mutationFn: () => notificationsService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    // 3. Mark Single Read
    const markReadMutation = useMutation({
        mutationFn: (id: string) => notificationsService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const handleMarkAllRead = () => markAllReadMutation.mutate();
    const handleNotificationClick = (id: string) => {
        const n = notifications.find(x => x.id === id);
        if (n && !n.is_read) markReadMutation.mutate(id);
    };

    if (loading) {
        return (
            <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    if (queryError) {
        return (
            <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
                <div className="text-center py-20">
                    <p className="text-red-600 font-medium">Failed to load notifications</p>
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Notification</h1>
                    <p className="text-sm md:text-lg text-muted-foreground mt-1">
                        Stay on top of your workspace updates...
                    </p>
                </div>
                <button
                    onClick={handleMarkAllRead}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                >
                    <Check className="w-4 h-4" />
                    Mark all as read
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-4 px-1">
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-border/60">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${activeTab === "all"
                            ? "bg-blue-50 text-blue-600 shadow-sm"
                            : "text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        All
                        {unreadCount > 0 && (
                            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "all" ? "bg-blue-100" : "bg-muted-foreground/10"}`}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    {currentWorkspace && (
                        <button
                            onClick={() => setActiveTab("workspace")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${activeTab === "workspace"
                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                : "text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            {currentWorkspace.name}&apos;s Workspace
                            {workspaceUnreadCount > 0 && (
                                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "workspace" ? "bg-blue-100" : "bg-muted-foreground/10"}`}>
                                    {workspaceUnreadCount}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-card rounded-[2rem] border border-border shadow-sm divide-y divide-border overflow-hidden">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`p-6 hover:bg-muted/40 transition-colors duration-200 cursor-pointer group ${!notification.is_read ? 'bg-blue-50/10' : ''}`}
                        onClick={() => handleNotificationClick(notification.id)}
                    >
                        <div className="flex items-start gap-4">
                            {/* Unread Indicator */}
                            <div className="pt-3">
                                <div className={`w-2 h-2 rounded-full ${!notification.is_read ? getSeverityColor(notification.severity) : 'bg-transparent'}`} />
                            </div>

                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 relative rounded-full overflow-hidden border border-border">
                                    <Image
                                        src={Images.user}
                                        alt="User"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-1">
                                <div className="text-[15px] leading-relaxed">
                                    <span className="font-bold text-foreground">{notification.action}</span>
                                </div>

                                {notification.description && (
                                    <p className="text-sm text-foreground/70">
                                        {notification.description}
                                    </p>
                                )}

                                <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 font-medium">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${notification.severity === 'error' ? 'bg-red-100 text-red-700' :
                                        notification.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                            notification.severity === 'success' ? 'bg-green-100 text-green-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {notification.severity}
                                    </span>
                                    {notification.note_type && (
                                        <>
                                            <span>•</span>
                                            <span>{notification.note_type.replace('_', ' ')}</span>
                                        </>
                                    )}
                                    <span>•</span>
                                    <span>{formatTimeAgo(notification.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-20 px-4">
                        <div className="h-16 w-16 bg-muted rounded-full mx-auto flex items-center justify-center mb-4 text-muted-foreground">
                            <span className="text-2xl">📭</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">No updates</p>
                        <p className="text-sm text-muted-foreground mt-1">You&apos;re all caught up!</p>
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            {notifications.length > 0 && pagination.total_pages > 1 && (
                <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    <div className="flex items-center gap-4">
                        <p className="text-sm font-medium text-muted-foreground">
                            Showing <span className="text-foreground">{(pagination.page - 1) * pagination.page_size + 1} to {Math.min(pagination.page * pagination.page_size, pagination.total_count)}</span> of <span className="text-foreground">{pagination.total_count} notifications</span>
                        </p>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Page size:</span>
                            <Select value={pageSize.toString()} onValueChange={(val) => setPageSize(Number(val))}>
                                <SelectTrigger className="h-8 w-20 rounded-xl border border-border bg-white text-xs font-bold">
                                    <SelectValue placeholder="20" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-border bg-white shadow-xl">
                                    <SelectGroup>
                                        {[10, 20, 30, 40, 50].map((size) => (
                                            <SelectItem key={size} value={size.toString()} className="text-xs font-medium hover:bg-muted cursor-pointer transition-colors">
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={pagination.page === 1}
                            className="px-6 py-2.5 rounded-xl border border-border bg-white text-sm font-bold text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm font-bold bg-muted rounded-xl border border-border">
                            {pagination.page} of {pagination.total_pages}
                        </span>
                        <button 
                            onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                            disabled={pagination.page === pagination.total_pages}
                            className="px-6 py-2.5 rounded-xl border border-border bg-white text-sm font-bold text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
