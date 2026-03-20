import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskCompletion, UserProfile } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<[import("@icp-sdk/core/principal").Principal, UserProfile]>
  >({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTasksByIds(ids: bigint[]) {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["tasks", ids.map(String).join(",")],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksByIds(ids);
    },
    enabled: !!actor && !isFetching && ids.length > 0,
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.completeTask(taskId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
      qc.invalidateQueries({ queryKey: ["taskHistory"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useTaskHistory() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<TaskCompletion[]>({
    queryKey: ["taskHistory"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserTaskHistory(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSubmitWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amountCents,
      paymentMethod,
    }: { amountCents: bigint; paymentMethod: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitWithdrawalRequest(amountCents, paymentMethod);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
