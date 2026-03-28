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
import NextImage from "next/image";
import { Images } from "@/public";
import { monitoringService } from "@/libs/api/services";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function ActivityLogsPage() {
    const { data: logsRes, isLoading } = useQuery({
        queryKey: ['activityLogs'],
        queryFn: () => monitoringService.getLogs(),
        staleTime: 5 * 60 * 1000,
    });

    const logs = (logsRes as any)?.data?.results?.data || (logsRes as any)?.data || [];
    return (
        <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-2">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Activity Logs</h1>
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
                                    <input type="checkbox" className="h-5 w-5 rounded-md border-border text-blue-600 focus:ring-blue-500" />
                                </th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">User</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">Event</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">Type</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">Description</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground last:rounded-r-2xl">Timeline date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan={6} className="py-20 text-center text-muted-foreground">Loading activity logs...</td></tr>
                            ) : logs.map((log: any, i: number) => (
                                <tr key={i} className="group hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <input type="checkbox" className="h-5 w-5 rounded-md border-border text-blue-600 focus:ring-blue-500" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 relative rounded-full overflow-hidden border border-border">
                                                <NextImage src={log.avatar || Images.user} alt={log.user || ""} fill className="object-cover" />
                                            </div>
                                            <span className="font-semibold text-foreground">{log.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg border border-border bg-white group-hover:bg-blue-50 transition-colors">
                                                {log.icon}
                                            </div>
                                            <span className="text-sm font-medium">{log.event}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                            {log.desc}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-foreground whitespace-nowrap">
                                            {log.date}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        Showing <span className="text-foreground">1 to 20</span> of <span className="text-foreground">103 logs</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <button className="px-6 py-2.5 rounded-xl border border-border bg-white text-sm font-bold text-foreground hover:bg-muted disabled:opacity-50 transition-colors" disabled>
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm font-bold bg-muted rounded-xl border border-border">
                            1 of 6
                        </span>
                        <button className="px-6 py-2.5 rounded-xl border border-border bg-white text-sm font-bold text-foreground hover:bg-muted transition-colors">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
