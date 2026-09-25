import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { Task } from "../types";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await api.get<{ tasks: Task[] }>("/tasks");
      return data.tasks;
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Task>) => {
      const { data } = await api.post<{ task: Task }>("/tasks", payload);
      return data.task;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Task> & { id: string }) => {
      const { data } = await api.patch<{ task: Task }>(`/tasks/${id}`, payload);
      return data.task;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

/**
 * Persists a full board rearrangement (drag between/within columns) in one
 * request. Applies an optimistic update to the cache first so the UI never
 * snaps or flickers while the request is in flight, then reconciles with
 * the server's response.
 */
export function useReorderTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tasks: { id: string; status: string; order: number }[]) => {
      const { data } = await api.patch<{ tasks: Task[] }>("/tasks/reorder", { tasks });
      return data.tasks;
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);

      if (previous) {
        const updateMap = new Map(updates.map((u) => [u.id, u]));
        const next = previous.map((t) => {
          const u = updateMap.get(t._id);
          return u ? { ...t, status: u.status as Task["status"], order: u.order } : t;
        });
        queryClient.setQueryData(["tasks"], next);
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
