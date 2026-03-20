import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    name: string;
    rewardCents: bigint;
    description: string;
}
export type Time = bigint;
export interface TaskCompletion {
    completionDay: Time;
    taskId: bigint;
}
export interface UserProfile {
    name: string;
    lastTaskCompletionDay?: Time;
    totalEarnings: bigint;
    streakCount: bigint;
    balanceCents: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTask(name: string, description: string, rewardCents: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeTask(taskId: bigint): Promise<void>;
    completeTaskById(taskId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<[Principal, UserProfile]>>;
    getTasksByIds(taskIds: Array<bigint>): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTaskHistory(user: Principal): Promise<Array<TaskCompletion>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitWithdrawalRequest(amountCents: bigint, paymentMethod: string): Promise<void>;
}
