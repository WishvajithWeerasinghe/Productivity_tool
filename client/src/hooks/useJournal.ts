import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { JournalEntry } from "../types";

export function useJournalEntries() {
  return useQuery({
    queryKey: ["journal"],
    queryFn: async () => {
      const { data } = await api.get<{ entries: JournalEntry[] }>("/journal");
      return data.entries;
    },
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { content: string; date: string }) => {
      const { data } = await api.post<{ entry: JournalEntry }>("/journal", payload);
      return data.entry;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["journal"] }),
  });
}
