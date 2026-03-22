"use client";

import React from "react";
import Image from "next/image";
import UserAvatar from "../ui/UserAvatar";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { Images } from "@/public";

function cn(...classes: (string | undefined | false)[]): string {
    return classes.filter(Boolean).join(" ");
}

const priorityStyles: Record<string, string> = {
    high: "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50",
    medium: "bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50",
    low: "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50",
};

interface TaskCardProps {
    task: any;
    onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const priorityKey = task.priority?.toLowerCase() || "medium";
    const priorityDisplay = task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || "Medium";

    return (
        <Card
            onClick={onClick}
            className={cn(
                "rounded-2xl shadow-sm bg-muted text-card-foreground border-border hover:shadow-md transition-all duration-200 py-3 overflow-hidden",
                onClick && "cursor-pointer hover:border-primary/50"
            )}
        >
            <CardHeader className="pb-2 pt-4 px-4">
                <span className="text-xs text-primary font-bold">
                    #{task.ticket_number}
                </span>
                <h3 className="text-sm font-bold leading-tight mt-1">{task.task_name}</h3>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4 pt-0">
                <div
                    className="text-xs text-muted-foreground leading-relaxed line-clamp-2 prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-ul:my-0"
                    dangerouslySetInnerHTML={{ __html: task.task_description || "" }}
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(task.end_date)}
                    </div>
                    <Badge
                        className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold border shadow-none",
                            priorityStyles[priorityKey]
                        )}
                    >
                        {priorityDisplay}
                    </Badge>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                        <UserAvatar
                            user={{
                                name: task.assigned_user?.first_name || "Unassigned",
                                avatar: task.assigned_user?.avatar
                            }}
                            size={28}
                            className="h-7 w-7 border border-border"
                        />
                        <span className="text-xs text-foreground font-semibold">{task.assigned_user?.first_name || "Unassigned"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="font-bold">{task.attachments?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="font-bold">{task.comments?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
