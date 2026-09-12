import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { User } from "../types";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get<{ user: User }>("/auth/me");
      return data.user;
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post<{ user: User }>("/auth/login", payload);
      return data.user;
    },
    onSuccess: (user) => queryClient.setQueryData(["me"], user),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string }) => {
      const { data } = await api.post<{ user: User }>("/auth/register", payload);
      return data.user;
    },
    onSuccess: (user) => queryClient.setQueryData(["me"], user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.post("/auth/logout"),
    onSuccess: () => queryClient.setQueryData(["me"], null),
  });
}
