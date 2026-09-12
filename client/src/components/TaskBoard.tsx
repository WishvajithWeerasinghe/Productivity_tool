import { useState } from "react";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../hooks/useTasks";
import { Task, TaskStatus } from "../types";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export default function TaskBoard() {
  const { data: tasks = [], isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [newTitle, setNewTitle] = useState("");

  function handleAdd() {
    if (!newTitle.trim()) return;
    createTask.mutate({ title: newTitle.trim(), status: "todo" });
    setNewTitle("");
  }

  function moveTask(task: Task, status: TaskStatus) {
    updateTask.mutate({ id: task._id, status });
  }

  if (isLoading) return <p className="text-slate-400">Loading tasks…</p>;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New task title…"
          className="flex-1 px-3 py-2 rounded bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button onClick={handleAdd} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500">
          Add
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className="bg-slate-900 rounded-xl p-4 min-h-[300px]">
            <h2 className="font-semibold mb-3 text-slate-300">{col.label}</h2>
            <div className="space-y-2">
              {tasks
                .filter((t) => t.status === col.key)
                .map((task) => (
                  <div key={task._id} className="bg-slate-800 rounded-lg p-3">
                    <p className="text-sm">{task.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <select
                        value={task.status}
                        onChange={(e) => moveTask(task, e.target.value as TaskStatus)}
                        className="text-xs bg-slate-700 rounded px-1 py-0.5"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => deleteTask.mutate(task._id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
