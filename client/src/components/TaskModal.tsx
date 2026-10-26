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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="solid-surface surface w-full max-w-md space-y-4 border-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{mode === "create" ? "New task" : "Edit task"}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
          >
            ×
          </button>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fix login redirect bug"
            className="field w-full px-3 py-2.5 text-sm"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details…"
            rows={3}
            className="field w-full resize-none px-3 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="field w-full px-2 py-2.5 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="field w-full px-2 py-2.5 text-sm capitalize"
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
          <label className="mb-1 block text-xs font-semibold text-slate-600">Tags (comma separated)</label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="frontend, bug, urgent"
            className="field w-full px-3 py-2.5 text-sm"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {mode === "edit" && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
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
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="button-primary px-4 py-2 text-sm"
            >
              {saving ? "Saving…" : mode === "create" ? "Create task" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
