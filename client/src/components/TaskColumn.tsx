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
      className={`flex max-h-[70vh] min-h-[340px] flex-col rounded-xl border p-3 transition-colors ${
        isOver ? "border-violet-300 bg-violet-50/70" : "border-slate-100 bg-slate-50/80"
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${accentClass}`} />
          <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-sm">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          title="Add task"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-lg leading-none text-slate-400 transition hover:bg-white hover:text-violet-700 hover:shadow-sm"
        >
          +
        </button>
      </div>

      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="scroll-thin flex-1 space-y-2 overflow-y-auto pr-1">
          {tasks.length === 0 && (
            <p className="select-none py-8 text-center text-xs text-slate-400">Drop tasks here</p>
          )}
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
