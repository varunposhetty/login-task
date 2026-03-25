import { useState, useEffect } from 'react';
import { tasksAPI } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function TaskDialog({ open, onOpenChange, task, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate(undefined);
    }
  }, [task, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      };

      if (isEditing) {
        await tasksAPI.update(task.id, payload);
        toast.success('Task updated');
      } else {
        await tasksAPI.create(payload);
        toast.success('Task created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-950 border-neutral-800 rounded-none max-w-lg" data-testid="task-dialog">
        <DialogHeader>
          <DialogTitle className="text-white font-black tracking-tight">
            {isEditing ? 'Edit Task' : 'Create Task'}
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-xs">
            {isEditing ? 'Update the task details below.' : 'Fill in the details to create a new task.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div>
            <label className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-500 block mb-2">
              Title *
            </label>
            <input
              data-testid="task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black border border-neutral-800 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-white focus:outline-none focus:border-white"
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-500 block mb-2">
              Description
            </label>
            <textarea
              data-testid="task-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-black border border-neutral-800 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-white focus:outline-none focus:border-white resize-none"
              placeholder="Add details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-500 block mb-2">
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger
                  className="bg-black border-neutral-800 rounded-none text-sm h-10"
                  data-testid="task-status-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-950 border-neutral-800 rounded-none">
                  <SelectItem value="todo" className="rounded-none">Todo</SelectItem>
                  <SelectItem value="in_progress" className="rounded-none">In Progress</SelectItem>
                  <SelectItem value="done" className="rounded-none">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-500 block mb-2">
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger
                  className="bg-black border-neutral-800 rounded-none text-sm h-10"
                  data-testid="task-priority-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-950 border-neutral-800 rounded-none">
                  <SelectItem value="low" className="rounded-none">Low</SelectItem>
                  <SelectItem value="medium" className="rounded-none">Medium</SelectItem>
                  <SelectItem value="high" className="rounded-none">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-500 block mb-2">
              Due Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  data-testid="task-due-date-trigger"
                  className="w-full bg-black border border-neutral-800 px-4 py-2.5 text-sm text-left flex items-center justify-between hover:border-neutral-600 focus:ring-1 focus:ring-white focus:outline-none"
                >
                  <span className={dueDate ? 'text-white' : 'text-neutral-600'}>
                    {dueDate ? format(dueDate, 'MMM dd, yyyy') : 'Select a date'}
                  </span>
                  <CalendarIcon className="w-4 h-4 text-neutral-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-neutral-950 border-neutral-800 rounded-none" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  className="bg-neutral-950 text-white"
                  data-testid="task-calendar"
                />
              </PopoverContent>
            </Popover>
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate(undefined)}
                className="text-xs text-neutral-500 hover:text-white mt-1"
                data-testid="clear-due-date"
              >
                Clear date
              </button>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 text-sm border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600"
              data-testid="task-cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black font-semibold px-5 py-2.5 text-sm hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              data-testid="task-submit-button"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black animate-spin" />
              ) : (
                isEditing ? 'Update Task' : 'Create Task'
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
