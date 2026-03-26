"use client";

import { useState, useEffect } from "react";
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
  Ban,
  Loader2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Image, { StaticImageData } from "next/image";
import { format, subDays, subMonths } from "date-fns";
import { Images } from "@/public";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import {
  AnalyticsService,
  DashboardStats,
  DashboardCharts,
  PerformanceAnalytics,
} from "@/app/services/analytics";
import UserAvatar from "@/app/components/ui/UserAvatar";

interface Member {
  name: string;
  email: string;
  phone: string;
  role: string;
  jobRole?: string;
  firstName?: string;
  lastName?: string;
  avatar?: StaticImageData | string;
  assigned: number;
  completed: number;
  overdue: number;
  rate: string;
  completionStats: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  // Added for efficiency score
  efficiency?: number;
  avgTime?: number;
}

export default function ReportsPage() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { currentWorkspace } = useWorkspace();

  // Time filter state
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "3m" | "all">(
    "30d",
  );

  // State for API data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [performance, setPerformance] = useState<PerformanceAnalytics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount, workspace change, or filter change
  useEffect(() => {
    if (!currentWorkspace?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculate date parameters
        const today = new Date();
        let dateFrom: string | undefined = undefined;
        let dateTo: string = format(today, "yyyy-MM-dd");
        let period: "weekly" | "monthly" | "quarterly" | "yearly" = "monthly"; // Used by charts

        switch (timeFilter) {
          case "7d":
            dateFrom = format(subDays(today, 7), "yyyy-MM-dd");
            period = "weekly";
            break;
          case "30d":
            dateFrom = format(subDays(today, 30), "yyyy-MM-dd");
            period = "monthly";
            break;
          case "3m":
            dateFrom = format(subMonths(today, 3), "yyyy-MM-dd");
            period = "quarterly";
            break;
          case "all":
            dateFrom = undefined; // backend handles empty as all time
            period = "yearly"; // Or however backend handles all-time trend
            break;
        }

        const params = { DateFrom: dateFrom, DateTo: dateTo };
        const chartParams = {
          Period: period,
          DateFrom: dateFrom,
          DateTo: dateTo,
        };

        const [statsData, chartsData, perfData] = await Promise.all([
          AnalyticsService.getDashboardStats(currentWorkspace.id, params),
          AnalyticsService.getDashboardCharts(currentWorkspace.id, chartParams),
          AnalyticsService.getPerformanceAnalytics(currentWorkspace.id, params),
        ]);

        setStats(statsData);
        setCharts(chartsData);
        setPerformance(perfData);
      } catch (err) {
        console.error("Failed to fetch report data:", err);
        setError("Failed to load report data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentWorkspace?.id, timeFilter]);

  // Map API status data to chart format or use defaults if empty
  const statusChartData = charts?.statusData.map((item) => {
    let color = "#cbd5e1"; // default slate-300
    if (item.label === "completed") color = "#22C55E";
    else if (item.label === "in_progress") color = "#3B82F6";
    else if (item.label === "pending") color = "#F97316";
    else if (item.label === "blocked") color = "#EF4444";

    let name: string;
    if (item.label === "in_progress") {
      name = "In Progress";
    } else {
      name =
        item.label.charAt(0).toUpperCase() +
        item.label.slice(1).replace("_", " ");
    }

    return {
      name,
      value: item.value,
      color,
    };
  }) || [
      { name: "Completed", value: 0, color: "#22C55E" },
      { name: "In Progress", value: 0, color: "#3B82F6" },
      { name: "Pending", value: 0, color: "#F97316" },
    ];

  // Filter out zero values for cleaner chart
  const activeStatusData = statusChartData.filter((d) => d.value > 0);
  const displayStatusData =
    activeStatusData.length > 0
      ? activeStatusData
      : [{ name: "No Data", value: 1, color: "#e2e8f0" }];

  // Prepare member data from API
  const membersData: Member[] =
    charts?.memberPerformance.map((m) => ({
      name: m.member_name, // Backend now provides full name or username fallback
      email: m.member_email,
      phone: m.member_phone || "-",
      role: m.member_role || "Member",
      jobRole: m.member_job_role || "Team Member",
      firstName: m.member_first_name,
      lastName: m.member_last_name,
      avatar: m.member_avatar, // Avatar from backend or handled by UserAvatar lookup or default
      completed: m.tasks_completed,
      assigned:
        (m.tasks_pending || 0) +
        (m.tasks_in_progress || 0) +
        (m.tasks_completed || 0),
      overdue: m.tasks_overdue || 0,
      rate: `${m.efficiency_score}%`,
      completionStats: {
        completed: m.tasks_completed,
        inProgress: m.tasks_in_progress || 0,
        notStarted: m.tasks_pending || 0,
      },
      efficiency: m.efficiency_score,
      avgTime: m.avg_completion_time,
    })) || [];

  // Loading state
  if (loading && !stats) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // CSV Export Logic
  const handleExportReports = () => {
    if (!membersData.length) return;

    // Create CSV Header
    const headers = [
      "Name",
      "Email",
      "Role",
      "Assigned Tasks",
      "Completed Tasks",
      "Overdue Tasks",
      "Completion Rate (%)",
      "Avg Time (Days)",
    ];

    // Create CSV Rows
    const rows = membersData.map((member) => [
      member.name.replace(/,/g, ""), // remove commas to prevent csv breaking
      member.email,
      member.jobRole?.replace(/,/g, "") || "Team Member",
      member.assigned,
      member.completed,
      member.overdue,
      member.efficiency || 0,
      member.avgTime || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${currentWorkspace?.name?.replace(/ /g, "_") || "Workspace"}_Productivity_Report_${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-muted min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Productivity Reports - {currentWorkspace?.name || "Loading..."}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Workspace performance and team productivity tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600 pointer-events-none" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="appearance-none rounded-xl border border-blue-200 bg-white py-2.5 pl-10 pr-10 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="3m">Last 3 months</option>
              <option value="all">All Time</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600 pointer-events-none" />
          </div>

          {(currentWorkspace?.user_role === "Owner" ||
            currentWorkspace?.user_role === "Admin") && (
              <button
                onClick={handleExportReports}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
              >
                <Download className="h-4 w-4" />
                Export Reports
              </button>
            )}
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
            <h2 className="text-5xl font-bold">{stats?.totalTasks || 0}</h2>
            <p className="text-sm mt-2 opacity-80">
              {stats?.inProgressTasks || 0} Currently Active
            </p>
          </div>
        </div>

        <StatCard
          title="Completed Task"
          value={stats?.completedTasks.toString() || "0"}
          subValue={`${performance?.completionRate ? Math.round(performance.completionRate) : 0}% Completion Rate`}
          icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
          subColor="text-blue-600"
        />
        <StatCard
          title="Overdue Tasks"
          value={stats?.overdueTasks.toString() || "0"}
          subValue={`Average Completion: ${performance?.averageTaskTime || 0}d`}
          icon={<AlertCircle className="h-5 w-5 text-blue-600" />}
          subColor="text-blue-600"
        />
        <StatCard
          title="Team Members"
          value={stats?.totalMembers.toString() || "0"}
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
                  data={displayStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {displayStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Chart Labels Overlay - Manual positioning as requested, but using dynamic values */}
            <div className="absolute top-0 left-0 text-xs font-semibold text-muted-foreground">
              Pending{" "}
              <span className="text-[#F97316]">
                {statusChartData.find((d) => d.name === "Pending")?.value || 0}
              </span>
            </div>
            <div className="absolute top-1/2 -right-4 text-xs font-semibold text-muted-foreground -translate-y-1/2">
              Completed{" "}
              <span className="text-[#22C55E]">
                {statusChartData.find((d) => d.name === "Completed")?.value ||
                  0}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 text-xs font-semibold text-muted-foreground">
              In Progress{" "}
              <span className="text-[#3B82F6]">
                {statusChartData.find((d) => d.name === "In Progress")?.value ||
                  0}
              </span>
            </div>
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
              <p className="text-sm font-medium text-muted-foreground">
                Average Task Duration
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  {performance?.averageTaskTime || 0}d
                </span>
                <div className="bg-green-100 p-1 rounded-md">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-muted-foreground">
                Task per Member
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  {stats?.totalMembers
                    ? Math.round(stats.totalTasks / stats.totalMembers)
                    : 0}
                </span>
                <div className="bg-green-100 p-1 rounded-md">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-muted-foreground">
                Overall Success Rate
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  {performance?.completionRate
                    ? Math.round(performance.completionRate)
                    : 0}
                  %
                </span>
                <div className="bg-green-100 p-1 rounded-md">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blocker Overview */}
        <div className="lg:col-span-4 rounded-[2.5rem] bg-card p-8 border border-border flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Ban className="h-8 w-8 text-red-500" />
            <h3 className="text-2xl font-bold">Blocker Overview</h3>
          </div>
          <div className="relative flex-1">
            <div className="space-y-5 max-h-[260px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
              {performance?.bottlenecks && performance.bottlenecks.length > 0 ? (
                performance.bottlenecks.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-1 self-stretch bg-red-500 rounded-full flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-base font-bold text-foreground">
                        #{item.ticket_number} - {item.area}
                      </p>
                      <div className="flex items-start gap-1.5 mt-1">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground font-medium">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-2 opacity-50" />
                  <p className="text-muted-foreground font-medium">
                    No blockers detected.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Great job keeping the workflow smooth!
                  </p>
                </div>
              )}
            </div>
            {performance?.bottlenecks && performance.bottlenecks.length > 3 && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            )}
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
            <h3 className="text-2xl font-bold tracking-tight">
              Top 5 Completion Rate
            </h3>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Chart Area */}
            <div className="flex-1 space-y-8">
              {membersData.length > 0 ? (
                membersData.slice(0, 5).map((member, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="w-32 flex-shrink-0">
                      <p
                        className="text-base font-medium text-foreground truncate"
                        title={member.name}
                      >
                        {member.name}
                      </p>
                    </div>
                    <div className="flex-1 flex gap-2 ">
                      {/* Completed */}
                      <div
                        className="bg-[#10B981] h-full rounded-lg flex items-center px-3 py-2 md:py-3 text-sm font-bold text-foreground/80 transition-all hover:opacity-90"
                        style={{ flex: member.completionStats.completed }}
                      >
                        {member.completionStats.completed}
                      </div>
                      {/* In Progress */}
                      <div
                        className="bg-[#60A5FA] h-full rounded-lg flex items-center px-3 py-2 md:py-3 text-sm font-bold text-foreground/80 transition-all hover:opacity-90"
                        style={{ flex: member.completionStats.inProgress }}
                      >
                        {member.completionStats.inProgress}
                      </div>
                      {/* Not Started */}
                      <div
                        className="bg-[#E5E7EB] h-full rounded-lg flex items-center px-3 py-2 md:py-3 text-sm font-bold text-foreground/80 transition-all hover:opacity-90"
                        style={{ flex: member.completionStats.notStarted }}
                      >
                        {member.completionStats.notStarted}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No member performance data available.
                </p>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-col justify-center gap-8 pl-4 md:border-l border-border/50 min-w-[140px]">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="text-sm font-medium text-foreground">
                  Completed
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                <span className="text-sm font-medium text-foreground">
                  In Progress
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                <span className="text-sm font-medium text-foreground">
                  Not Started
                </span>
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
              <p className="text-base text-muted-foreground">
                Most Productive Member
              </p>
              <p className="text-base font-bold text-foreground">
                {membersData.length > 0
                  ? membersData.reduce((prev, current) =>
                    prev.completed > current.completed ? prev : current,
                  ).name
                  : "N/A"}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-base text-muted-foreground">
                Least Overdue Tasks
              </p>
              <p className="text-base font-bold text-foreground">
                {membersData.length > 0
                  ? membersData.reduce((prev, current) =>
                    prev.overdue < current.overdue ? prev : current,
                  ).name
                  : "N/A"}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-base text-muted-foreground">
                Completion Trend (vs. Prior Period)
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">--</span>
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
          <table className="w-full min-w-full">
            <thead className="bg-muted/50 rounded-xl overflow-hidden">
              <tr className="text-left text-xs md:text-sm font-medium text-muted-foreground">
                <th className="px-3 md:px-6 py-4 first:rounded-l-xl">
                  Members
                </th>
                <th className="px-3 md:px-6 py-4 hidden md:table-cell">
                  Assigned
                </th>
                <th className="px-3 md:px-6 py-4">Completed</th>
                <th className="px-3 md:px-6 py-4 hidden lg:table-cell">
                  Overdue
                </th>
                <th className="px-3 md:px-6 py-4 hidden xl:table-cell">Rate</th>
                <th className="px-3 md:px-6 py-4 last:rounded-r-xl"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {membersData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 md:px-6 py-8 text-center text-muted-foreground"
                  >
                    No Member Data Found
                  </td>
                </tr>
              ) : (
                membersData.map((member, idx) => (
                  <tr
                    key={idx}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 md:px-6 py-5">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <UserAvatar
                          user={{
                            name: member.name,
                            first_name: member.firstName,
                            last_name: member.lastName,
                            email: member.email,
                            avatar: member.avatar,
                          }}
                          size={40}
                          className="h-8 md:h-10 w-8 md:w-10 border border-border group-hover:border-blue-200 transition-colors flex-shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-xs md:text-sm text-foreground group-hover:text-blue-600 transition-colors truncate">
                            {member.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate hidden md:block">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-5 font-bold text-xs md:text-sm text-muted-foreground hidden md:table-cell">
                      {member.assigned || 0}
                    </td>
                    <td className="px-3 md:px-6 py-5 font-bold text-xs md:text-sm text-green-500">
                      {member.completed}
                    </td>
                    <td className="px-3 md:px-6 py-5 font-bold text-xs md:text-sm text-red-400 hidden lg:table-cell">
                      {member.overdue || 0}
                    </td>
                    <td className="px-3 md:px-6 py-5 font-bold text-xs md:text-sm text-blue-500 hidden xl:table-cell">
                      {member.rate}
                    </td>
                    <td className="px-3 md:px-6 py-5">
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="text-xs md:text-sm text-blue-600 font-bold hover:underline"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Report Modal */}
      {selectedMember && (
        <PerformanceReportModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          userRole={currentWorkspace?.user_role}
        />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subValue,
  icon,
  subColor,
}: {
  title: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
  subColor: string;
}) {
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

function PerformanceReportModal({
  member,
  onClose,
  userRole,
}: {
  member: Member;
  onClose: () => void;
  userRole?: string;
}) {
  const handleDownloadIndividualReport = () => {
    // Create CSV Header
    const headers = ["Metric", "Value"];

    // Create CSV Rows
    const rows = [
      ["Name", member.name.replace(/,/g, "")],
      ["Email", member.email],
      ["Phone", member.phone],
      ["Role", member.role],
      ["Job Role", member.jobRole?.replace(/,/g, "") || "Team Member"],
      ["Total Assigned Tasks", member.assigned.toString()],
      ["Completed Tasks", member.completed.toString()],
      ["In Progress Tasks", member.completionStats.inProgress.toString()],
      ["Not Started Tasks", member.completionStats.notStarted.toString()],
      ["Overdue Tasks", member.overdue.toString()],
      ["Average Duration (Days)", (member.avgTime || 0).toString()],
      ["Overall Completion Rate (%)", (member.efficiency || 0).toString()],
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${member.name.replace(/ /g, "_")}_Performance_Report_${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-card w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Individual Performance Report
              </h2>
              <p className="text-muted-foreground">
                Focused metrics for {member.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="bg-muted rounded-3xl p-6 flex flex-col border border-border">
              <div className="relative w-full flex justify-center mb-4">
                <div className="h-32 w-32 relative rounded-2xl overflow-hidden border border-border">
                  <UserAvatar
                    user={{
                      name: member.name,
                      email: member.email,
                      avatar: member.avatar,
                    }}
                    size={128}
                    className="h-full w-full rounded-2xl"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground text-center">
                {member.name}
              </h3>
              <div className="flex justify-center mt-2">
                <span className="rounded-lg bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 w-fit border border-orange-500">
                  {member.role || "Member"}
                </span>
              </div>

              <div className="mt-6 w-full space-y-3 text-left flex flex-col items-center">
                <span className="truncate text-sm text-foreground">
                  {member.email}
                </span>
                <span className="text-sm text-foreground">{member.phone}</span>
                <p className="font-medium text-sm text-muted-foreground">
                  {member.jobRole || "Team Member"}
                </p>
              </div>
            </div>

            {/* Metrics Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Completion Rate Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <p className="font-bold text-lg">Overall Completion Rate</p>
                  <p className="text-green-600 font-bold text-lg">
                    {member.rate || "0%"}
                  </p>
                </div>
                <div className="h-16 w-full bg-muted rounded-xl overflow-hidden flex border border-border">
                  <div
                    className="h-full bg-[#00C48C] transition-all duration-500"
                    style={{
                      width: member.efficiency ? `${member.efficiency}%` : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Mini Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-foreground">
                      Avg. Duration
                    </p>
                    <Clock className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold">{member.avgTime || 0}d</p>
                  <p className="text-xs text-blue-500 mt-1">
                    Average Time Taken
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-foreground">
                      Overdue Tasks
                    </p>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-3xl font-bold">{member.overdue || 0}</p>
                  <p className="text-xs text-blue-500 mt-1">Overdue Tasks</p>
                </div>
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-foreground">
                      Completed Task
                    </p>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">{member.completed || 0}</p>
                  <p className="text-xs text-blue-500 mt-1">Task Done</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                {(userRole === "Owner" || userRole === "Admin") && (
                  <button
                    onClick={handleDownloadIndividualReport}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                  >
                    <Download className="h-5 w-5" />
                    Download Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
