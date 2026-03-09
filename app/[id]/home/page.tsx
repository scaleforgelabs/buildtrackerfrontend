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

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, subMonths } from "date-fns";
import { Images } from "@/public";
import UserAvatar from "@/app/components/ui/UserAvatar";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import api from "@/libs/api";

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

export default function DashboardSection() {
  const { currentWorkspace } = useWorkspace();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "3m" | "all">("7d");

  const fetchDashboardData = async () => {
    if (!currentWorkspace?.id) return;

    try {
      setLoading(true);

      const today = new Date();
      let dateFrom: string | undefined = undefined;
      let dateTo: string = format(today, 'yyyy-MM-dd');
      let period: 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'weekly';

      switch (timeFilter) {
        case "7d":
          dateFrom = format(subDays(today, 7), 'yyyy-MM-dd');
          period = "weekly";
          break;
        case "30d":
          dateFrom = format(subDays(today, 30), 'yyyy-MM-dd');
          period = "monthly";
          break;
        case "3m":
          dateFrom = format(subMonths(today, 3), 'yyyy-MM-dd');
          period = "quarterly";
          break;
        case "all":
          dateFrom = undefined;
          period = "yearly";
          break;
      }

      const params = { DateFrom: dateFrom, DateTo: dateTo };
      const chartParams = { Period: period };

      const [statsRes, chartsRes, trendsRes, tasksRes] = await Promise.all([
        api.get(`/analytics/workspaces/${currentWorkspace.id}/dashboard/stats`, { params }),
        api.get(`/analytics/workspaces/${currentWorkspace.id}/dashboard/charts`, { params: chartParams }),
        api.get(`/analytics/workspaces/${currentWorkspace.id}/analytics/trends`, { params }),
        api.get(`/tasks/${currentWorkspace.id}/tasks/`, { params }),
      ]);

      setStats(statsRes.data);
      setChartData(chartsRes.data);
      setTrendData(trendsRes.data);
      setRecentTasks(tasksRes.data.results?.data?.slice(0, 4) || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentWorkspace?.id, timeFilter]);

  const performanceData = trendData?.completionTrend?.map((item, idx) => {
    const dateObj = new Date(item.date);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const inProgress = trendData?.velocityTrend?.[idx]?.value || 0;
    return {
      date: dayNames[dateObj.getDay()],
      completed: item.value,
      inProgress: inProgress,
    };
  }) || [];

  const statusChartData = chartData?.statusData?.map((item) => ({
    name: item.label.charAt(0).toUpperCase() + item.label.slice(1),
    value: item.value,
    color: item.label === "pending" ? "#3b82f6" : item.label === "in_progress" ? "#f59e0b" : "#10b981",
  })) || [];

  const priorityDistribution = chartData?.priorityData || [];
  const highPriority = priorityDistribution.find((p) => p.label === "high")?.value || 0;
  const mediumPriority = priorityDistribution.find((p) => p.label === "medium")?.value || 0;
  const lowPriority = priorityDistribution.find((p) => p.label === "low")?.value || 0;
  const totalPriority = highPriority + mediumPriority + lowPriority || 1;

  const highPercent = Math.round((highPriority / totalPriority) * 100);
  const mediumPercent = Math.round((mediumPriority / totalPriority) * 100);
  const lowPercent = Math.round((lowPriority / totalPriority) * 100);

  const healthScore = Math.round((stats?.velocity || 0) * 100);

  const handleExportReports = () => {
    if (!stats || !chartData) return;

    // Create CSV Header
    const headers = ["Metric", "Value", "", "Member Performance", "Tasks Completed", "Avg Time", "Efficiency"];

    // Create CSV Rows for Overall Stats
    const rows = [
      ["Total Tasks", stats.totalTasks.toString(), "", "", "", "", ""],
      ["Completed Tasks", stats.completedTasks.toString(), "", "", "", "", ""],
      ["In Progress", stats.inProgressTasks.toString(), "", "", "", "", ""],
      ["Overdue Tasks", stats.overdueTasks.toString(), "", "", "", "", ""],
      ["Health Score (%)", healthScore.toString(), "", "", "", "", ""],
      ["", "", "", "", "", "", ""], // Empty row separator
    ];

    // Add Member Performance rows side-by-side if available
    chartData.memberPerformance?.forEach((member, index) => {
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

  return (
    <section className="bg-muted w-full rounded-2xl">
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
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="appearance-none rounded-lg border border-primary text-primary px-3 py-1.5 pr-8 text-sm bg-background font-medium hover:bg-blue-50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="3m">Last 3 months</option>
                <option value="all">All Time</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
            </div>

            <button
              onClick={() => fetchDashboardData()}
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm bg-background hover:bg-muted font-medium transition-colors"
            >
              <RefreshCcw className="w-4 h-4" /> Reload
            </button>

            {(currentWorkspace?.user_role === 'Owner' || currentWorkspace?.user_role === 'Admin') && (
              <button
                onClick={handleExportReports}
                className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-sm hover:bg-primary/90 font-medium transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" /> Export
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
          <div className="xl:col-span-2 bg-background rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Performance Trend</h3>
            </div>
            <div className="h-64 -mx-2">
              <PerformanceLineChart data={performanceData} />
            </div>
          </div>

          <div className="bg-background rounded-2xl p-4">
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
          <div className="xl:col-span-2 bg-background rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex gap-3 items-center">
                <History className="w-5 h-5 text-primary" />
                Recent Task
              </h3>
              <button className="flex items-center gap-1 text-sm text-primary border border-primary rounded-full px-3 py-1">
                <Plus className="w-4 h-4" /> New Task
              </button>
            </div>

            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
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

            <div className="flex h-6 overflow-hidden mb-6">
              <div className="bg-red-500 w-[20%] rounded-r-md" style={{ width: `${highPercent}%` }} />
              <div className="bg-yellow-500 w-[30%] rounded-r-md" style={{ width: `${mediumPercent}%` }} />
              <div className="bg-green-500 w-[50%] rounded-r-md" style={{ width: `${lowPercent}%` }} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Priority
                label="High"
                value={String(highPriority)}
                percentage={`(${highPercent}%)`}
                color="text-red-500"
              />
              <Priority
                label="Medium"
                value={String(mediumPriority)}
                percentage={`(${mediumPercent}%)`}
                color="text-yellow-500"
              />
              <Priority
                label="Low"
                value={String(lowPriority)}
                percentage={`(${lowPercent}%)`}
                color="text-green-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
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
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "Pending":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
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
          <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorCreated)"
          strokeWidth={2}
          name="Completed"
        />
        <Area
          type="monotone"
          dataKey="inProgress"
          stroke="#f59e0b"
          fillOpacity={0.5}
          strokeWidth={2}
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
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

function Priority({ label, value, percentage, color }: { label: string; value: string; percentage: string; color: string }) {
  return (
    <div className="rounded-xl border border-border p-3 text-right flex flex-col gap-15">
      <div className="flex items-center justify-left gap-1 mb-2">
        <div className={`w-2 h-2 rounded-full ${color.replace("text-", "bg-")}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{percentage}</p>
        <p className="text-4xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
