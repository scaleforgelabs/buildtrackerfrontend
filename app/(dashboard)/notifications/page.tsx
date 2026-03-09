"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Check, Loader2 } from "lucide-react";
import { Images } from "@/public";
import { notificationsService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";

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
    const [activeTab, setActiveTab] = useState("all");
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentWorkspace } = useWorkspace();

    console.log('🎯 NotificationsPage rendered:', { currentWorkspace: currentWorkspace?.id });

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const workspaceUnreadCount = notifications.filter(n => !n.is_read && n.workspace === currentWorkspace?.id).length;

    const fetchNotifications = async () => {
        console.log('🚀 Starting fetchNotifications...');
        try {
            setLoading(true);
            setError(null);
            
            console.log('📡 Making API call...', { activeTab, currentWorkspace: currentWorkspace?.id });
            console.log('🔍 notificationsService:', notificationsService);
            
            const response = activeTab === "all" 
                ? await notificationsService.getNotifications()
                : currentWorkspace 
                    ? await notificationsService.getWorkspaceNotifications(currentWorkspace.id)
                    : await notificationsService.getNotifications();
            
            console.log('🔔 Notifications API Response:', response.data);
            setNotifications(response.data.results.data);
        } catch (err: any) {
            console.error('❌ Failed to fetch notifications:', err);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleNotificationClick = async (id: string) => {
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.is_read) {
            try {
                await notificationsService.markAsRead(id);
                setNotifications(prev => prev.map(n => 
                    n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
                ));
            } catch (err) {
                console.error('Failed to mark as read:', err);
            }
        }
    };

    useEffect(() => {
        console.log('🔄 useEffect triggered:', { activeTab, currentWorkspace: currentWorkspace?.id });
        fetchNotifications();
    }, [activeTab, currentWorkspace]);

    if (loading) {
        return (
            <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
                <div className="text-center py-20">
                    <p className="text-red-600 font-medium">{error}</p>
                    <button 
                        onClick={fetchNotifications}
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

                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        notification.severity === 'error' ? 'bg-red-100 text-red-700' :
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
        </div>
    );
}
