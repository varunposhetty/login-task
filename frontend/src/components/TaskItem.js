import { format, parseISO, isPast, isToday } from 'date-fns';
import { Check, Pencil, Trash2, MoreHorizontal, Circle, Clock } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG = {
  todo: { label: 'Todo', color: 'bg-neutral-600', textColor: 'text-neutral-300' },
  in_progress: { label: 'In Progress', color: 'bg-amber-500', textColor: 'text-amber-400' },
  done: { label: 'Done', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

export function TaskItem({ task, onEdit, onDelete, onToggleComplete }) {
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const dueDateObj = task.due_date ? parseISO(task.due_date) : null;
  const isOverdue = dueDateObj && isPast(dueDateObj) && !isToday(dueDateObj) && task.status !== 'done';

  return (
    <div
      className="task-row border-b border-neutral-800 px-6 py-3 lg:grid lg:grid-cols-[1fr_120px_100px_120px_40px] lg:items-center gap-4"
      data-testid={`task-item-${task.id}`}
    >
      {/* Title + Description */}
      <div className="flex items-start gap-3 min-w-0">
        <button
          onClick={() => onToggleComplete(task)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 border flex items-center justify-center transition-colors ${
            task.status === 'done'
              ? 'bg-emerald-500 border-emerald-500 text-black'
              : 'border-neutral-600 hover:border-white text-transparent hover:text-neutral-600'
          }`}
          data-testid={`toggle-complete-${task.id}`}
          title={task.status === 'done' ? 'Mark as todo' : 'Mark as done'}
        >
          <Check className="w-3 h-3" />
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium truncate ${
              task.status === 'done' ? 'line-through text-neutral-500' : 'text-white'
            }`}
            data-testid={`task-title-${task.id}`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-neutral-500 font-light truncate mt-0.5">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="mt-2 lg:mt-0">
        <div className="flex items-center gap-1.5">
          <Circle className={`w-2 h-2 fill-current ${statusCfg.textColor}`} />
          <span className={`text-xs ${statusCfg.textColor}`}>{statusCfg.label}</span>
        </div>
      </div>

      {/* Priority */}
      <div className="mt-1 lg:mt-0">
        <Badge
          variant="outline"
          className={`text-[10px] rounded-none px-2 py-0.5 border ${priorityCfg.bg} ${priorityCfg.color}`}
          data-testid={`task-priority-badge-${task.id}`}
        >
          {priorityCfg.label}
        </Badge>
      </div>

      {/* Due Date */}
      <div className="mt-1 lg:mt-0">
        {dueDateObj ? (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-neutral-400'}`}>
            <Clock className="w-3 h-3" />
            <span data-testid={`task-due-date-${task.id}`}>
              {format(dueDateObj, 'MMM dd')}
            </span>
          </div>
        ) : (
          <span className="text-xs text-neutral-700">--</span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-2 lg:mt-0 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1 text-neutral-500 hover:text-white"
              data-testid={`task-actions-${task.id}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-neutral-950 border-neutral-800 rounded-none w-36">
            <DropdownMenuItem
              onClick={() => onEdit(task)}
              className="text-xs rounded-none cursor-pointer"
              data-testid={`edit-task-${task.id}`}
            >
              <Pencil className="w-3 h-3 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleComplete(task)}
              className="text-xs rounded-none cursor-pointer"
              data-testid={`toggle-task-${task.id}`}
            >
              <Check className="w-3 h-3 mr-2" />
              {task.status === 'done' ? 'Mark Todo' : 'Mark Done'}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-xs text-red-400 focus:text-red-400 rounded-none cursor-pointer"
              data-testid={`delete-task-${task.id}`}
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
