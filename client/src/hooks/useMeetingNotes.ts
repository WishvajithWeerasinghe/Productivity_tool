import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { CreateMeetingNote, MeetingNote } from "../types/meetingNotes";
import { useCurrentUser } from "./useAuth";

export function useMeetingNotes() {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: ["meeting-notes", user?.id],
    enabled: Boolean(user),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    queryFn: async () => {
      const { data } = await api.get<{ notes: MeetingNote[] }>("/meeting-notes");
      return data.notes;
    },
  });
}

export function useUpdateMeetingTime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, meetingTime }: { id: string; meetingTime: string }) => {
      const { data } = await api.patch<{ note: MeetingNote }>(`/meeting-notes/${id}`, { meetingTime });
      return data.note;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meeting-notes"] }),
  });
}

export function useCreateMeetingNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMeetingNote) => {
      const { data } = await api.post<{ note: MeetingNote }>("/meeting-notes", payload);
      return data.note;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meeting-notes"] }),
  });
}
