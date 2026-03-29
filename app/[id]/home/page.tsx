"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  RefreshCcw,
  Download,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  PieChart,
  Plus,
  Radiation,
  ListChecks,
  VectorSquare,
  History,
} from "lucide-react";

import dynamic from "next/dynamic";
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false });
const RechartsPieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });
import { format, subDays, subMonths } from "date-fns";
import { Images } from "@/public";
import UserAvatar from "@/app/components/ui/UserAvatar";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { AnalyticsService } from "@/app/services/analytics";
import { tasksService } from "@/libs/api/services";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  totalMembers: number;
  velocity: number;
  healthScore: number;
}

interface ChartData {
  statusData: Array<{ label: string; value: number }>;
  priorityData: Array<{ label: string; value: number }>;
  trendData: Array<{ date: string; label: string; value: number }>;
  memberPerformance: Array<{
    member_name: string;
    tasks_completed: number;
    avg_completion_time: number;
    efficiency_score: number;
  }>;
}

interface TrendData {
  taskCreationTrend: Array<{ date: string; value: number; change_percentage: number }>;
  completionTrend: Array<{ date: string; value: number; change_percentage: number }>;
  velocityTrend: Array<{ date: string; value: number; change_percentage: number }>;
}

interface Task {
  id: string;
  task_name: string;
  task_description: string;
  assigned_user: { first_name: string; email: string };
  status: string;
  priority: string;
}

function DashboardSkeleton() {
  return (
    <main className="bg-muted w-full rounded-2xl animate-pulse">
      <div className="bg-muted rounded-2xl p-4 lg:p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-64"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-96"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
            <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-200 dark:bg-gray-800 h-32 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700"></div>
              </div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-gray-200 dark:bg-gray-800 rounded-2xl p-4 h-80 min-w-0"></div>
          <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl p-4 h-80 min-w-0"></div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-gray-200 dark:bg-gray-800 rounded-2xl p-4 h-64 min-w-0"></div>
          <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl p-4 h-64 min-w-0"></div>
        </div>
      </div>
    </main>
  );
}

export default function DashboardSection() {
  const { currentWorkspace } = useWorkspace();
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "3m" | "all">("30d");
  const pathname = usePathname();
  const isRouteActive = pathname.endsWith('/home') || pathname.match(/\/[a-zA-Z0-9-]+\/?$/) !== null;

  // 1. Fetch Stats
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['dashboardStats', currentWorkspace?.id, timeFilter],
    queryFn: async () => {
      const wsId = currentWorkspace?.id;
      if (!wsId) return null;
      const today = new Date();
      let dateFrom: string | undefined = undefined;
      const dateTo: string = format(today, 'yyyy-MM-dd');
      if (timeFilter === "7d") dateFrom = format(subDays(today, 7), 'yyyy-MM-dd');
      else if (timeFilter === "30d") dateFrom = format(subDays(today, 30), 'yyyy-MM-dd');
      else if (timeFilter === "3m") dateFrom = format(subMonths(today, 3), 'yyyy-MM-dd');
      return AnalyticsService.getDashboardStats(wsId, { DateFrom: dateFrom, DateTo: dateTo });
    },
    enabled: !!currentWorkspace?.id && isRouteActive,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Fetch Charts
  const { data: chartData, isLoading: loadingCharts, refetch: refetchCharts } = useQuery({
    queryKey: ['dashboardCharts', currentWorkspace?.id, timeFilter],
    queryFn: async () => {
      const wsId = currentWorkspace?.id;
      if (!wsId) return null;
      let period: 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'weekly';
      if (timeFilter === "30d") period = "monthly";
      else if (timeFilter === "3m") period = "quarterly";
      else if (timeFilter === "all") period = "yearly";
      return AnalyticsService.getDashboardCharts(wsId, { Period: period });
    },
    enabled: !!currentWorkspace?.id && isRouteActive,
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch Trends
  const { data: trendData, isLoading: loadingTrends, refetch: refetchTrends } = useQuery({
    queryKey: ['dashboardTrends', currentWorkspace?.id, timeFilter],
    queryFn: async () => {
      const wsId = currentWorkspace?.id;
      if (!wsId) return null;
      const today = new Date();
      let dateFrom: string | undefined = undefined;
      const dateTo: string = format(today, 'yyyy-MM-dd');
      if (timeFilter === "7d") dateFrom = format(subDays(today, 7), 'yyyy-MM-dd');
      else if (timeFilter === "30d") dateFrom = format(subDays(today, 30), 'yyyy-MM-dd');
      else if (timeFilter === "3m") dateFrom = format(subMonths(today, 3), 'yyyy-MM-dd');
      return AnalyticsService.getTrends(wsId, { DateFrom: dateFrom, DateTo: dateTo });
    },
    enabled: !!currentWorkspace?.id && isRouteActive,
    staleTime: 5 * 60 * 1000,
  });

  // 4. Fetch Recent Tasks
  const { data: recentTasksRes, isLoading: loadingTasks, refetch: refetchTasks } = useQuery({
    queryKey: ['recentTasks', currentWorkspace?.id],
    queryFn: async () => {
      const wsId = currentWorkspace?.id;
      if (!wsId) return null;
      return tasksService.getTasksByWorkspace(wsId, { PageSize: 5 });
    },
    enabled: !!currentWorkspace?.id && isRouteActive,
    staleTime: 2 * 60 * 1000,
  });

  const recentTasks: Task[] = (recentTasksRes as any)?.data?.results?.data || (recentTasksRes as any)?.data || [];
  const loading = loadingStats || loadingCharts || loadingTrends || loadingTasks;

  const actualTrendData = (trendData as any)?.data || trendData;
  const actualChartData = (chartData as any)?.data || chartData;
  const actualStats = (stats as any)?.data || stats;

  const performanceData = actualTrendData?.completionTrend?.map((item: any, idx: number) => {
    const dateObj = new Date(item.date);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const inProgress = actualTrendData?.velocityTrend?.[idx]?.value || 0;
    return {
      date: dayNames[dateObj.getDay()],
      completed: item.value,
      inProgress: inProgress,
    };
  }) || [];

  const statusChartData = actualChartData?.statusData?.map((item: any) => {
    const label = item.label.toLowerCase().replace(/_/g, ' ');
    // MAPPING: Sync with Performance Trend (Completed: Green, In Progress: Blue, Pending: Amber)
    let color = "#f59e0b"; // Default Amber (Pending)

    if (label.includes("complete") || label.includes("done") || label.includes("success")) {
      color = "#22c55e";
    } else if (label.includes("progress") || label.includes("doing") || label.includes("active")) {
      color = "#3b82f6";
    } else if (label.includes("pending") || label.includes("todo") || label.includes("hold")) {
      color = "#f59e0b";
    }

    return {
      name: label.split(' ').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      value: item.value,
      fill: color, // Add fill directly for Pie
      color: color, // Keep color for other components
    };
  }) || [];

  const priorityDistribution = actualChartData?.priorityData || [];
  const highPriority = priorityDistribution.find((p: any) => p.label === "high")?.value || 0;
  const mediumPriority = priorityDistribution.find((p: any) => p.label === "medium")?.value || 0;
  const lowPriority = priorityDistribution.find((p: any) => p.label === "low")?.value || 0;
  const totalPriority = highPriority + mediumPriority + lowPriority || 1;

  const highPercent = Math.round((highPriority / totalPriority) * 100);
  const mediumPercent = Math.round((mediumPriority / totalPriority) * 100);
  const lowPercent = Math.round((lowPriority / totalPriority) * 100);

  const healthScore = actualStats?.healthScore || 0;

  const handleExportReports = () => {
    if (!stats || !chartData) return;

    // Create CSV Header
    const headers = ["Metric", "Value", "", "Member Performance", "Tasks Completed", "Avg Time", "Efficiency"];

    // Create CSV Rows for Overall Stats
    const rows = [
      ["Total Tasks", actualStats.totalTasks.toString(), "", "", "", "", ""],
      ["Completed Tasks", actualStats.completedTasks.toString(), "", "", "", "", ""],
      ["In Progress", actualStats.inProgressTasks.toString(), "", "", "", "", ""],
      ["Overdue Tasks", actualStats.overdueTasks.toString(), "", "", "", "", ""],
      ["Health Score (%)", healthScore.toString(), "", "", "", "", ""],
      ["", "", "", "", "", "", ""], // Empty row separator
    ];

    // Add Member Performance rows side-by-side if available
    actualChartData.memberPerformance?.forEach((member: any, index: number) => {
      if (rows[index]) {
        rows[index][3] = member.member_name.replace(/,/g, '');
        rows[index][4] = member.tasks_completed.toString();
        rows[index][5] = member.avg_completion_time.toString();
        rows[index][6] = `${member.efficiency_score}%`;
      } else {
        rows.push(["", "", "", member.member_name.replace(/,/g, ''), member.tasks_completed.toString(), member.avg_completion_time.toString(), `${member.efficiency_score}%`]);
      }
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${currentWorkspace?.name?.replace(/ /g, '_') || 'Workspace'}_Dashboard_Summary_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="bg-muted w-full rounded-2xl">
      <div className="bg-muted rounded-2xl p-4 lg:p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Dashboard - {currentWorkspace?.name || "Loading..."}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Facilitate clear task organization and efficient completion for your team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <label htmlFor="time-filter" className="sr-only">Filter by time period</label>
              <select
                id="time-filter"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="appearance-none rounded-lg border border-primary text-primary px-3 py-1.5 pr-8 text-sm bg-background font-medium hover:bg-blue-50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="3m">Last 3 months</option>
                <option value="all">All Time</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" aria-hidden="true" />
            </div>

            <button
              onClick={() => {
                refetchStats();
                refetchCharts();
                refetchTrends();
                refetchTasks();
              }}
              aria-label="Reload dashboard data"
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm bg-background hover:bg-muted font-medium transition-colors"
            >
              <RefreshCcw className="w-4 h-4" aria-hidden="true" /> Reload
            </button>

            {(currentWorkspace?.user_role === 'Owner' || currentWorkspace?.user_role === 'Admin') && (
              <button
                onClick={handleExportReports}
                aria-label="Export report as CSV"
                className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-sm hover:bg-primary/90 font-medium transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" aria-hidden="true" /> Export
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-primary text-primary-foreground p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm">Health Score</span>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-5xl font-semibold">{healthScore}%</p>
            <p className="text-sm opacity-80">Project performance</p>
          </div>

          <StatCard
            title="Completed"
            value={String(stats?.completedTasks || 0)}
            label="Task Done"
            icon={<ListChecks />}
          />

          <StatCard
            title="Active"
            value={String(stats?.inProgressTasks || 0)}
            label="In Progress"
            icon={<Radiation />}
          />

          <StatCard
            title="Overdue"
            value={String(stats?.overdueTasks || 0)}
            label="Needs Attention"
            icon={<AlertTriangle />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-background rounded-2xl p-4 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Performance Trend</h3>
            </div>
            <div className="h-64 -mx-2">
              <PerformanceLineChart data={performanceData} />
            </div>
          </div>

          <div className="bg-background rounded-2xl p-4 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Status Overview</h3>
            </div>
            <div className="h-56">
              <StatusDonutChart data={statusChartData} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-background rounded-2xl p-4 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex gap-3 items-center">
                <History className="w-5 h-5 text-primary" />
                Recent Task
              </h3>
              <button
                aria-label="Create new task"
                className="flex items-center gap-1 text-sm text-primary border border-primary rounded-full px-3 py-1"
              >
                <Plus className="w-4 h-4" aria-hidden="true" /> New Task
              </button>
            </div>

            {recentTasks.length > 0 ? (
              recentTasks.map((task: any) => (
                <TaskRow
                  key={task.id}
                  name={task.assigned_user?.first_name || "Unassigned"}
                  task={task.task_name}
                  status={task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  user={task.assigned_user}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4">No recent tasks</p>
            )}
          </div>

          <div className="bg-background rounded-2xl p-4 h-fit">
            <h3 className="font-medium mb-4 flex gap-3 items-center">
              <VectorSquare className="w-5 h-5 text-primary" /> Priority Distribution
            </h3>

            <div className="flex h-6 overflow-hidden mb-6 bg-slate-100 dark:bg-slate-800 rounded-md">
              <div className="bg-[#ef4444] rounded-r-sm transition-all duration-500" style={{ width: `${highPercent}%` }} title={`High: ${highPercent}%`} />
              <div className="bg-[#f59e0b] rounded-r-sm transition-all duration-500" style={{ width: `${mediumPercent}%` }} title={`Medium: ${mediumPercent}%`} />
              <div className="bg-[#22c55e] rounded-sm transition-all duration-500" style={{ width: `${lowPercent}%` }} title={`Low: ${lowPercent}%`} />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Priority
                label="High"
                value={String(highPriority)}
                percentage={`(${highPercent}%)`}
                color="#ef4444"
              />
              <Priority
                label="Medium"
                value={String(mediumPriority)}
                percentage={`(${mediumPercent}%)`}
                color="#f59e0b"
              />
              <Priority
                label="Low"
                value={String(lowPriority)}
                percentage={`(${lowPercent}%)`}
                color="#22c55e"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, label, icon }: { title: string; value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-background p-4 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <div className="w-9 h-9 rounded-full border border-muted-foreground flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-primary">{label}</p>
    </div>
  );
}

function TaskRow({ name, task, status, user }: { name: string; task: string; status: string; user?: any }) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Completed":
      case "Done":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "In Progress":
      case "Doing":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case "Pending":
      case "To Do":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "Blocked":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex items-center justify-between py-3 last:border-none">
      <div className="flex items-center gap-3">
        <UserAvatar user={user} size={32} />
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">Working on: {task}</p>
        </div>
      </div>
      <span className={`text-xs rounded-md border px-2.5 py-1 font-medium ${getStatusStyles(status)}`}>
        {status}
      </span>
    </div>
  );
}

function PerformanceLineChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="date" className="text-slate-600 dark:text-slate-400" />
        <YAxis className="text-slate-600 dark:text-slate-400" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            color: "hsl(var(--foreground))",
          }}
        />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="#22c55e"
          fillOpacity={1}
          fill="url(#colorCompleted)"
          strokeWidth={3}
          name="Completed"
        />
        <Area
          type="monotone"
          dataKey="inProgress"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorInProgress)"
          strokeWidth={3}
          name="In Progress"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatusDonutChart({ data }: { data: any[] }) {
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.8;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#64748b"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {name}
      </text>
    );
  };

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          />
          <Tooltip />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

function Priority({ label, value, percentage, color }: { label: string; value: string; percentage: string; color: string }) {
  return (
    <div className="rounded-xl border border-border p-2 sm:p-3 text-right flex flex-col justify-between gap-4 h-full bg-white/50 dark:bg-slate-900/50">
      <div className="flex items-center justify-start gap-1 mb-2">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs sm:text-sm font-medium truncate">{label}</span>
      </div>
      <div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-1">{percentage}</p>
        <p className="text-2xl sm:text-4xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
