import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { tasksAPI } from '@/lib/api';
import { toast } from 'sonner';
import { TaskDialog } from '@/components/TaskDialog';
import { TaskItem } from '@/components/TaskItem';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import {
  Plus, Search, LogOut, LayoutDashboard, ListTodo, BarChart3,
  ChevronDown, Filter, ArrowUpDown, Menu, X
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest First' },
  { value: 'created_at:asc', label: 'Oldest First' },
  { value: 'due_date:asc', label: 'Due Date (Earliest)' },
  { value: 'due_date:desc', label: 'Due Date (Latest)' },
  { value: 'priority:desc', label: 'Priority (High to Low)' },
  { value: 'priority:asc', label: 'Priority (Low to High)' },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('tasks');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at:desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = sortBy.split(':');
      const params = {
        page,
        per_page: 20,
        sort_by: sortField,
        sort_order: sortOrder,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (search.trim()) params.search = search.trim();

      const res = await tasksAPI.list(params);
      setTasks(res.data.tasks);
      setTotalPages(res.data.total_pages);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, search, sortBy, page]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await tasksAPI.analytics();
      setAnalytics(res.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, priorityFilter, search, sortBy]);

  const handleCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDelete = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      toast.success('Task deleted');
      fetchTasks();
      fetchAnalytics();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await tasksAPI.update(task.id, { status: newStatus });
      fetchTasks();
      fetchAnalytics();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleSaved = () => {
    setDialogOpen(false);
    setEditingTask(null);
    fetchTasks();
    fetchAnalytics();
  };

  const navItems = [
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="dashboard-grid min-h-screen bg-black" data-testid="dashboard-page">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col border-r border-neutral-800 bg-black">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold tracking-[0.1em] uppercase text-white">
              TaskHub
            </span>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-light transition-colors ${
                view === item.id
                  ? 'text-white bg-neutral-900 border-r-2 border-white'
                  : 'text-neutral-500 hover:text-white hover:bg-neutral-950'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-full flex items-center gap-3 px-2 py-2 text-sm text-neutral-400 hover:text-white rounded-none"
                data-testid="user-menu-trigger"
              >
                <div className="w-8 h-8 bg-neutral-800 flex items-center justify-center text-xs font-semibold text-white uppercase">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-neutral-950 border-neutral-800 rounded-none">
              <DropdownMenuItem
                onClick={logout}
                className="text-red-400 focus:text-red-400 rounded-none cursor-pointer"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold tracking-[0.1em] uppercase text-white">TaskHub</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-toggle">
          {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-[49px] left-0 right-0 z-40 bg-black border-b border-neutral-800 py-2"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm ${
                  view === item.id ? 'text-white bg-neutral-900' : 'text-neutral-500'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <DropdownMenuSeparator className="bg-neutral-800" />
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-6 py-3 text-sm text-red-400"
              data-testid="mobile-logout-button"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="min-h-screen md:pt-0 pt-[49px]">
        {view === 'tasks' && (
          <div className="flex flex-col h-full">
            {/* Top Bar */}
            <div className="border-b border-neutral-800 px-6 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white" data-testid="tasks-heading">
                    Tasks
                  </h1>
                  <p className="text-xs text-neutral-500 font-light mt-1">
                    {total} task{total !== 1 ? 's' : ''} total
                  </p>
                </div>
                <button
                  data-testid="create-task-button"
                  onClick={handleCreate}
                  className="bg-white text-black font-semibold px-5 py-2.5 text-sm flex items-center gap-2 hover:bg-neutral-200 active:scale-[0.98] self-start lg:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="border-b border-neutral-800 px-6 py-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    data-testid="search-input"
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-neutral-500" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger
                        className="w-[130px] bg-neutral-950 border-neutral-800 rounded-none text-xs h-9"
                        data-testid="status-filter"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-950 border-neutral-800 rounded-none">
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs rounded-none">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger
                      className="w-[130px] bg-neutral-950 border-neutral-800 rounded-none text-xs h-9"
                      data-testid="priority-filter"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-950 border-neutral-800 rounded-none">
                      {PRIORITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs rounded-none">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger
                        className="w-[160px] bg-neutral-950 border-neutral-800 rounded-none text-xs h-9"
                        data-testid="sort-select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-950 border-neutral-800 rounded-none">
                        {SORT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs rounded-none">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-5 h-5 border border-white/30 border-t-white animate-spin" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500" data-testid="empty-tasks">
                  <ListTodo className="w-12 h-12 mb-4 text-neutral-700" />
                  <p className="text-sm font-light">No tasks found</p>
                  <button
                    onClick={handleCreate}
                    className="mt-4 text-white text-sm border border-neutral-700 px-4 py-2 hover:bg-neutral-900"
                    data-testid="empty-create-task-button"
                  >
                    Create your first task
                  </button>
                </div>
              ) : (
                <div data-testid="task-list">
                  {/* Table header */}
                  <div className="hidden lg:grid grid-cols-[1fr_120px_100px_120px_40px] gap-0 px-6 py-2 border-b border-neutral-800 text-xs font-semibold tracking-[0.15em] uppercase text-neutral-500">
                    <span>Task</span>
                    <span>Status</span>
                    <span>Priority</span>
                    <span>Due Date</span>
                    <span></span>
                  </div>
                  <AnimatePresence mode="popLayout">
                    {tasks.map((task, i) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                      >
                        <TaskItem
                          task={task}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleComplete={handleToggleComplete}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-neutral-800 px-6 py-3 flex items-center justify-between" data-testid="pagination">
                <p className="text-xs text-neutral-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 text-xs border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    data-testid="prev-page-button"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 text-xs border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    data-testid="next-page-button"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'analytics' && (
          <AnalyticsPanel analytics={analytics} onRefresh={fetchAnalytics} />
        )}
      </main>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSaved={handleSaved}
      />
    </div>
  );
}
