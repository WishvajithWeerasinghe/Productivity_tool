import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus } from "../types";
import TaskCard from "./TaskCard";

interface TaskColumnProps {
  status: TaskStatus;
  label: string;
  accentClass: string;
  tasks: Task[];
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}

export default function TaskColumn({
  status,
  label,
  accentClass,
  tasks,
  onAddTask,
  onTaskClick,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-900 rounded-xl p-3 flex flex-col min-h-[420px] max-h-[70vh] border transition-colors ${
        isOver ? "border-indigo-500/60 bg-slate-900/80" : "border-transparent"
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${accentClass}`} />
          <h2 className="font-semibold text-sm text-slate-200">{label}</h2>
          <span className="text-xs text-slate-500 bg-slate-800 rounded-full px-1.5 py-0.5">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          title="Add task"
          className="text-slate-400 hover:text-white hover:bg-slate-800 w-6 h-6 rounded flex items-center justify-center text-lg leading-none"
        >
          +
        </button>
      </div>

      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 overflow-y-auto scroll-thin flex-1 pr-1">
          {tasks.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-6 select-none">Drop tasks here</p>
          )}
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
