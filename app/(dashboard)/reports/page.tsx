"use client";

import { useState } from "react";
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Download,
    Users,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ArrowUpRight,
    X,
    Clock,
    Phone,
    Mail,
    Ban
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import Image, { StaticImageData } from "next/image";
import { Images } from "@/public";

const statusData = [
    { name: "Completed", value: 3, color: "#22C55E" },
    { name: "In Progress", value: 4, color: "#3B82F6" },
    { name: "Pending", value: 1, color: "#F97316" }, // Adjusted colors to match image implied palette if needed, kept visually distinct
];

interface Member {
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar: StaticImageData | string;
    assigned: number;
    completed: number;
    overdue: number;
    rate: string;
    completionStats: {
        completed: number;
        inProgress: number;
        notStarted: number;
    }
}

const PerformanceRanking: Member[] = [
    {
        name: "Muaz Balogun",
        email: "muazbalogun97@gmail.com",
        phone: "+234555890457",
        role: "Software Engineer (BackEnd)",
        avatar: Images.user,
        assigned: 65,
        completed: 35,
        overdue: 10,
        rate: "54%",
        completionStats: { completed: 35, inProgress: 20, notStarted: 10 }
    },
    {
        name: "Abdullah Saliu",
        email: "aosoliu10@gmail.com",
        phone: "+234555890457",
        role: "Product Designer",
        avatar: Images.user,
        assigned: 65,
        completed: 28,
        overdue: 17,
        rate: "43%",
        completionStats: { completed: 28, inProgress: 20, notStarted: 17 }
    },
    {
        name: "Muhammad Ali",
        email: "ali@example.com",
        phone: "+234555890457",
        role: "Frontend Developer",
        avatar: Images.user,
        assigned: 63,
        completed: 19,
        overdue: 10,
        rate: "30%",
        completionStats: { completed: 19, inProgress: 34, notStarted: 10 }
    },
    {
        name: "Abdulateef J.O",
        email: "lateef@example.com",
        phone: "+234555890457",
        role: "Mobile Developer",
        avatar: Images.user,
        assigned: 74,
        completed: 15,
        overdue: 23,
        rate: "20%",
        completionStats: { completed: 15, inProgress: 36, notStarted: 23 }
    },
    {
        name: "Team Done",
        email: "team@example.com",
        phone: "+234555890457",
        role: "QA Engineer",
        avatar: Images.user,
        assigned: 74,
        completed: 15,
        overdue: 23,
        rate: "20%",
        completionStats: { completed: 15, inProgress: 36, notStarted: 23 }
    },
];

export default function ReportsPage() {
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    return (
        <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-2">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Productivity Report</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Workspace performance and team productivity tracking.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                        <Calendar className="h-4 w-4" />
                        Last 30 days
                        <ChevronDown className="h-4 w-4" />
                    </button>
                    <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
                        <Download className="h-4 w-4" />
                        Export Reports
                    </button>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[2rem] bg-blue-600 p-7 text-white flex flex-col justify-between min-h-[160px]">
                    <div className="flex justify-between items-start">
                        <p className="text-base font-medium opacity-90">Total Task</p>
                        <div className="bg-white/20 p-2 rounded-lg">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-5xl font-bold">12</h2>
                        <p className="text-sm mt-2 opacity-80">12 Currently Active</p>
                    </div>
                </div>

                <StatCard
                    title="Completed Task"
                    value="10"
                    subValue="85% Completion Rate"
                    icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
                    subColor="text-blue-600"
                />
                <StatCard
                    title="Overdue Tasks"
                    value="0"
                    subValue="Average Completion: 3.2d"
                    icon={<AlertCircle className="h-5 w-5 text-blue-600" />}
                    subColor="text-blue-600"
                />
                <StatCard
                    title="Team Members"
                    value="3"
                    subValue="Needs Attention"
                    icon={<Users className="h-5 w-5 text-blue-600" />}
                    subColor="text-blue-600"
                />
            </div>

            {/* Middle Row Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Task Status */}
                <div className="lg:col-span-4 rounded-[2.5rem] bg-card p-8 border border-border">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="p-2 rounded-lg bg-blue-50">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold">Task Status Distribution</h3>
                    </div>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Chart Labels Overlay */}
                        <div className="absolute top-0 left-0 text-xs font-semibold text-muted-foreground">Pending <span className="text-[#F97316]">1</span></div>
                        <div className="absolute top-1/2 right-0 text-xs font-semibold text-muted-foreground -translate-y-1/2">Completed <span className="text-[#22C55E]">3</span></div>
                        <div className="absolute bottom-0 left-0 text-xs font-semibold text-muted-foreground">In Progress <span className="text-[#3B82F6]">4</span></div>
                    </div>
                </div>

                {/* Performance Average */}
                <div className="lg:col-span-4 rounded-[2.5rem] bg-card p-8 border border-border">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="p-2 rounded-lg bg-orange-50">
                            <TrendingUp className="h-5 w-5 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-bold">Performance Average</h3>
                    </div>
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-muted-foreground">Average Task Duration</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">3.2d</span>
                                <div className="bg-green-100 p-1 rounded-md">
                                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-muted-foreground">Task per Member</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">0</span>
                                <div className="bg-green-100 p-1 rounded-md">
                                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-muted-foreground">Overall Success Rate</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">0%</span>
                                <div className="bg-green-100 p-1 rounded-md">
                                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Blocker Overview */}
                <div className="lg:col-span-4 rounded-[2.5rem] bg-card p-8 border border-border">
                    <div className="flex items-center gap-3 mb-8">
                        <Ban className="h-8 w-8 text-red-500" />
                        <h3 className="text-2xl font-bold">Blocker Overview</h3>
                    </div>
                    <div className="space-y-6">
                        {[
                            { title: "Create new report screen", desc: "No report feature explained in the PRD", checked: true },
                            { title: "Update the edit task page", desc: "No edit task page deployed originally", checked: false },
                            { title: "Connect the report generator to the page", desc: "No report feature explained in the PRD", checked: false },
                            { title: "Create new report screen", desc: "No report feature explained in the PRD", checked: false },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start justify-between group">
                                <div className="flex gap-4">
                                    <div className="w-1 self-stretch bg-red-500 rounded-full" />
                                    <div>
                                        <p className={`text-base font-bold ${item.checked ? 'text-muted-foreground line-through opacity-50' : 'text-foreground'}`}>
                                            {item.title}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <p className="text-sm text-muted-foreground font-medium">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        checked={item.checked}
                                        readOnly
                                        className="h-6 w-6 rounded-md border-2 border-muted-foreground/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                        style={{ accentColor: '#2563EB' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-[2.5rem] bg-card p-10 border border-border min-h-[300px]">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="p-2 rounded-xl bg-green-50/50 border border-green-100">
                            <BarChart3 className="h-6 w-6 text-green-700" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight">Top 5 Completion Rate</h3>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Chart Area */}
                        <div className="flex-1 space-y-8">
                            {PerformanceRanking.map((member, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="w-32 flex-shrink-0">
                                        <p className="text-base font-medium text-foreground">{member.name}</p>
                                    </div>
                                    <div className="flex-1 flex gap-2 h-12">
                                        {/* Completed */}
                                        <div
                                            className="bg-[#10B981] h-full rounded-lg flex items-center px-3 text-sm font-bold text-foreground/80 transition-all hover:opacity-90"
                                            style={{ flex: member.completionStats.completed }}
                                        >
                                            {member.completionStats.completed}
                                        </div>
                                        {/* In Progress */}
                                        <div
                                            className="bg-[#60A5FA] h-full rounded-lg flex items-center px-3 text-sm font-bold text-foreground/80 transition-all hover:opacity-90"
                                            style={{ flex: member.completionStats.inProgress }}
                                        >
                                            {member.completionStats.inProgress}
                                        </div>
                                        {/* Not Started */}
                                        <div
                                            className="bg-[#E5E7EB] h-full rounded-lg flex items-center px-3 text-sm font-bold text-foreground/80 transition-all hover:opacity-90"
                                            style={{ flex: member.completionStats.notStarted }}
                                        >
                                            {member.completionStats.notStarted}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col justify-center gap-8 pl-4 md:border-l border-border/50 min-w-[140px]">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                                <span className="text-sm font-medium text-foreground">Completed</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                                <span className="text-sm font-medium text-foreground">In Progress</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                                <span className="text-sm font-medium text-foreground">Not Started</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[2.5rem] bg-card p-8 border border-border">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="p-2 rounded-lg bg-orange-50">
                            <TrendingUp className="h-5 w-5 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-bold">Productivity Highlights</h3>
                    </div>
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <p className="text-base text-muted-foreground">Most Productive Member</p>
                            <p className="text-base font-bold text-foreground">Abdulhameed Alli-Shittu</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-base text-muted-foreground">Least Overdue Tasks</p>
                            <p className="text-base font-bold text-foreground">Muaz Balogun</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-base text-muted-foreground">Completion Trend (vs. Prior Period)</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">12%</span>
                                <div className="bg-green-100 p-1 rounded-md">
                                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Ranking Table */}
            <div className="rounded-[2.5rem] bg-card p-6 md:p-10 border border-border overflow-hidden">
                <div className="flex items-center gap-2 mb-8">
                    <div className="p-2 rounded-lg bg-blue-50">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold">Performance Ranking</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 rounded-xl overflow-hidden">
                            <tr className="text-left text-sm font-medium text-muted-foreground">
                                <th className="px-6 py-4 first:rounded-l-xl">Members</th>
                                <th className="px-6 py-4">Assigned</th>
                                <th className="px-6 py-4">Completed</th>
                                <th className="px-6 py-4">Overdue</th>
                                <th className="px-6 py-4">Rate</th>
                                <th className="px-6 py-4 last:rounded-r-xl"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {PerformanceRanking.map((member, idx) => (
                                <tr key={idx} className="group hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 relative rounded-full overflow-hidden border border-border group-hover:border-blue-200 transition-colors">
                                                <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                                            </div>
                                            <span className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">{member.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-muted-foreground">{member.assigned}</td>
                                    <td className="px-6 py-5 font-bold text-green-500">{member.completed}</td>
                                    <td className="px-6 py-5 font-bold text-red-400">{member.overdue}</td>
                                    <td className="px-6 py-5 font-bold text-blue-500">{member.rate}</td>
                                    <td className="px-6 py-5">
                                        <button
                                            onClick={() => setSelectedMember(member)}
                                            className="text-blue-600 font-bold hover:underline"
                                        >
                                            View Report
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance Report Modal */}
            {selectedMember && (
                <PerformanceReportModal
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                />
            )}
        </div>
    );
}

function StatCard({ title, value, subValue, icon, subColor }: { title: string; value: string; subValue: string; icon: React.ReactNode; subColor: string }) {
    return (
        <div className="rounded-[2rem] bg-card p-7 border border-border transition-shadow flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
                <p className="text-base font-bold text-foreground">{title}</p>
                <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                    {icon}
                </div>
            </div>
            <div>
                <h2 className="text-5xl font-bold text-foreground">{value}</h2>
                <p className={`text-sm mt-2 font-medium ${subColor}`}>{subValue}</p>
            </div>
        </div>
    );
}

function PerformanceReportModal({ member, onClose }: { member: Member; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-card w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-8 space-y-8">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Individual Performance Report</h2>
                            <p className="text-muted-foreground">Focused metrics for {member.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                            <X className="h-6 w-6 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="bg-muted rounded-3xl p-6 flex flex-col border border-border">
                            <div className="relative w-50 mx-auto h-50 rounded-2xl overflow-hidden mb-4">
                                <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                            <span className="mt-2  rounded-lg bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 w-fit border border-orange-500">
                                Member
                            </span>

                            <div className="mt-6 w-full space-y-3 text-left flex flex-col">

                                <span className="truncate">{member.email}</span>

                                <span>{member.phone}</span>


                                <p className="font-medium">{member.role}</p>

                            </div>
                        </div>

                        {/* Metrics Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Completion Rate Bar */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <p className="font-bold text-lg">Overall Completion Rate</p>
                                    <p className="text-green-600 font-bold text-lg">70%</p>
                                </div>
                                <div className="h-16 w-full bg-muted rounded-xl overflow-hidden flex border border-border">
                                    <div className="h-full bg-[#00C48C] w-[70%]" />
                                </div>
                            </div>

                            {/* Mini Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-5 rounded-2xl border border-border bg-card">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs font-bold text-foreground">Avg. Duration</p>
                                        <Clock className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <p className="text-3xl font-bold">2.5d</p>
                                    <p className="text-xs text-blue-500 mt-1">Average Time Taken</p>
                                </div>
                                <div className="p-5 rounded-2xl border border-border bg-card">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs font-bold text-foreground">Overdue Tasks</p>
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                    </div>
                                    <p className="text-3xl font-bold">10</p>
                                    <p className="text-xs text-blue-500 mt-1">Overdue Tasks</p>
                                </div>
                                <div className="p-5 rounded-2xl border border-border bg-card">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs font-bold text-foreground">Completed Task</p>
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                    </div>
                                    <p className="text-3xl font-bold">10</p>
                                    <p className="text-xs text-blue-500 mt-1">Task Done</p>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
                                    <Download className="h-5 w-5" />
                                    Download Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

