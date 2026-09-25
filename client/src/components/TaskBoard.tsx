import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useReorderTasks } from "../hooks/useTasks";
import { Task, TaskStatus } from "../types";
import TaskColumn from "./TaskColumn";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

const COLUMNS: { key: TaskStatus; label: string; accentClass: string }[] = [
  { key: "todo", label: "To Do", accentClass: "bg-slate-400" },
  { key: "in-progress", label: "In Progress", accentClass: "bg-amber-400" },
  { key: "done", label: "Done", accentClass: "bg-emerald-400" },
];

type BoardState = Record<TaskStatus, Task[]>;

function groupByStatus(tasks: Task[]): BoardState {
  const grouped: BoardState = { todo: [], "in-progress": [], done: [] };
  for (const task of [...tasks].sort((a, b) => a.order - b.order)) {
    grouped[task.status].push(task);
  }
  return grouped;
}

export default function TaskBoard() {
  const { data: tasks = [], isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const reorderTasks = useReorderTasks();

  const [board, setBoard] = useState<BoardState>({ todo: [], "in-progress": [], done: [] });
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [modalState, setModalState] = useState<
    | { mode: "create"; status: TaskStatus }
    | { mode: "edit"; task: Task }
    | null
  >(null);

  // Keep local board state in sync with the server, except while a drag
  // is actively in progress (avoids the board snapping mid-drag).
  useEffect(() => {
    if (!activeTask) {
      setBoard(groupByStatus(tasks));
    }
  }, [tasks, activeTask]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Requires a small movement before a drag starts, so a plain click
      // to open the edit modal isn't swallowed as a drag.
      activationConstraint: { distance: 6 },
    })
  );

  function findContainer(id: string): TaskStatus | undefined {
    if (id in board) return id as TaskStatus;
    return (Object.keys(board) as TaskStatus[]).find((status) =>
      board[status].some((t) => t._id === id)
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setBoard((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((t) => t._id === active.id);
      if (activeIndex === -1) return prev;

      const movedTask = { ...activeItems[activeIndex], status: overContainer };
      const overIndex = overItems.findIndex((t) => t._id === over.id);

      return {
        ...prev,
        [activeContainer]: activeItems.filter((t) => t._id !== active.id),
        [overContainer]:
          overIndex === -1
            ? [...overItems, movedTask]
            : [...overItems.slice(0, overIndex), movedTask, ...overItems.slice(overIndex)],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);
    if (!activeContainer || !overContainer) return;

    let finalBoard = board;

    if (activeContainer === overContainer) {
      const items = board[activeContainer];
      const oldIndex = items.findIndex((t) => t._id === active.id);
      const newIndex = items.findIndex((t) => t._id === over.id);
      if (oldIndex !== newIndex && newIndex !== -1) {
        finalBoard = { ...board, [activeContainer]: arrayMove(items, oldIndex, newIndex) };
        setBoard(finalBoard);
      }
    }

    // Persist order + status for every task in the columns that changed.
    const changedStatuses = new Set([activeContainer, overContainer]);
    const updates: { id: string; status: string; order: number }[] = [];
    changedStatuses.forEach((status) => {
      finalBoard[status].forEach((t, index) => {
        updates.push({ id: t._id, status, order: index });
      });
    });

    if (updates.length > 0) {
      reorderTasks.mutate(updates);
    }
  }

  function handleAddTask(status: TaskStatus) {
    setModalState({ mode: "create", status });
  }

  function handleSave(payload: Partial<Task>) {
    if (modalState?.mode === "create") {
      createTask.mutate(payload, { onSuccess: () => setModalState(null) });
    } else if (modalState?.mode === "edit") {
      updateTask.mutate({ id: modalState.task._id, ...payload }, { onSuccess: () => setModalState(null) });
    }
  }

  function handleDelete() {
    if (modalState?.mode === "edit") {
      deleteTask.mutate(modalState.task._id, { onSuccess: () => setModalState(null) });
    }
  }

  const isSaving = createTask.isPending || updateTask.isPending || deleteTask.isPending;

  const totalTasks = useMemo(() => tasks.length, [tasks]);

  if (isLoading) return <p className="text-slate-400">Loading tasks…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-slate-200">
          Board <span className="text-slate-500 text-sm font-normal">({totalTasks} tasks)</span>
        </h1>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <TaskColumn
              key={col.key}
              status={col.key}
              label={col.label}
              accentClass={col.accentClass}
              tasks={board[col.key]}
              onAddTask={() => handleAddTask(col.key)}
              onTaskClick={(task) => setModalState({ mode: "edit", task })}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      {modalState && (
        <TaskModal
          mode={modalState.mode}
          initialStatus={modalState.mode === "create" ? modalState.status : undefined}
          task={modalState.mode === "edit" ? modalState.task : undefined}
          onClose={() => setModalState(null)}
          onSave={handleSave}
          onDelete={modalState.mode === "edit" ? handleDelete : undefined}
          saving={isSaving}
        />
      )}
    </div>
  );
}
