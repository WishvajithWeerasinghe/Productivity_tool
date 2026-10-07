import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { CreateMeetingNote, MeetingNote } from "../types/meetingNotes";

export function useMeetingNotes() {
  return useQuery({
    queryKey: ["meeting-notes"],
    queryFn: async () => {
      const { data } = await api.get<{ notes: MeetingNote[] }>("/meeting-notes");
      return data.notes;
    },
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
