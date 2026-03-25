import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, ListTodo, TrendingUp, AlertTriangle, Zap, BarChart3, RefreshCw
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const STATUS_COLORS = {
  todo: '#737373',
  in_progress: '#f59e0b',
  done: '#10b981',
};

const PRIORITY_COLORS = {
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#ef4444',
};

export function AnalyticsPanel({ analytics, onRefresh }) {
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-5 h-5 border border-white/30 border-t-white animate-spin" />
      </div>
    );
  }

  const statusData = [
    { name: 'Todo', value: analytics.todo, color: STATUS_COLORS.todo },
    { name: 'In Progress', value: analytics.in_progress, color: STATUS_COLORS.in_progress },
    { name: 'Done', value: analytics.done, color: STATUS_COLORS.done },
  ];

  const priorityData = [
    { name: 'Low', value: analytics.low, color: PRIORITY_COLORS.low },
    { name: 'Medium', value: analytics.medium, color: PRIORITY_COLORS.medium },
    { name: 'High', value: analytics.high, color: PRIORITY_COLORS.high },
  ];

  const statCards = [
    {
      label: 'Total Tasks',
      value: analytics.total,
      icon: ListTodo,
      color: 'text-white',
    },
    {
      label: 'Completed',
      value: analytics.done,
      icon: CheckCircle2,
      color: 'text-emerald-400',
    },
    {
      label: 'In Progress',
      value: analytics.in_progress,
      icon: Clock,
      color: 'text-amber-400',
    },
    {
      label: 'Pending',
      value: analytics.todo,
      icon: AlertTriangle,
      color: 'text-neutral-400',
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs">
          <p className="text-white font-medium">{label || payload[0].name}</p>
          <p className="text-neutral-400">{payload[0].value} tasks</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6" data-testid="analytics-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white" data-testid="analytics-heading">
            Analytics
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Overview of your task performance
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600"
          data-testid="refresh-analytics-button"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid border border-neutral-800" data-testid="stat-cards">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className={`p-6 ${i < statCards.length - 1 ? 'border-r border-b lg:border-b-0 border-neutral-800' : 'border-b lg:border-b-0'} ${i >= 2 ? 'lg:border-r border-neutral-800' : ''}`}
            data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-500">
                {stat.label}
              </span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-3xl font-black tracking-tight text-white">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Completion */}
      <div className="mt-6 border border-neutral-800 p-6" data-testid="completion-section">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-500">
              Completion Rate
            </span>
          </div>
          <span className="text-2xl font-black text-white" data-testid="completion-percentage">
            {analytics.completion_percentage}%
          </span>
        </div>
        <Progress
          value={analytics.completion_percentage}
          className="h-1.5 bg-neutral-800 rounded-none"
          data-testid="completion-progress-bar"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mt-6 border border-neutral-800">
        {/* Status Bar Chart */}
        <div className="p-6 border-b lg:border-b-0 lg:border-r border-neutral-800" data-testid="status-chart">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-500">
              By Status
            </span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} barSize={40}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={0}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="p-6" data-testid="priority-chart">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-500">
              By Priority
            </span>
          </div>
          <div className="h-[200px] flex items-center">
            {analytics.total > 0 ? (
              <div className="flex items-center gap-6 w-full">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {priorityData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-neutral-400">
                        {item.name}
                      </span>
                      <span className="text-xs text-white font-medium ml-auto">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full text-neutral-600 text-sm">
                No data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
