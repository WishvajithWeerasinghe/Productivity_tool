import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../types";

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  high: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="cursor-grab rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md active:cursor-grabbing active:translate-y-0"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold leading-snug text-slate-800">{task.title}</p>
        <span
          className={`shrink-0 text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="mb-2 line-clamp-2 text-xs leading-5 text-slate-500">{task.description}</p>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
