import { FormEvent, useEffect, useState } from "react";
import { Task, TaskPriority, TaskStatus } from "../types";

interface TaskModalProps {
  mode: "create" | "edit";
  initialStatus?: TaskStatus;
  task?: Task;
  onClose: () => void;
  onSave: (payload: Partial<Task>) => void;
  onDelete?: () => void;
  saving?: boolean;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high"];

export default function TaskModal({
  mode,
  initialStatus,
  task,
  onClose,
  onSave,
  onDelete,
  saving,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? initialStatus ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [tagsInput, setTagsInput] = useState(task?.tags.join(", ") ?? "");

  // Close on Escape for a native-feeling modal.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({ title: title.trim(), description: description.trim(), status, priority, tags });
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-xl p-6 w-full max-w-md space-y-4 border border-slate-800"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{mode === "create" ? "New task" : "Edit task"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fix login redirect bug"
            className="w-full px-3 py-2 rounded bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details…"
            rows={3}
            className="w-full px-3 py-2 rounded bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-2 py-2 rounded bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-2 py-2 rounded bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-sm capitalize"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p} className="capitalize">
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Tags (comma separated)</label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="frontend, bug, urgent"
            className="w-full px-3 py-2 rounded bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {mode === "edit" && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Delete task
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : mode === "create" ? "Create task" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
