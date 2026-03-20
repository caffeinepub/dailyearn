import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bitcoin,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  CreditCard,
  DollarSign,
  Flame,
  Gamepad2,
  Loader2,
  LogOut,
  Medal,
  Play,
  SmartphoneNfc,
  Star,
  TrendingUp,
  Trophy,
  UserCheck,
  UserPlus,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCompleteTask,
  useLeaderboard,
  useSaveUserProfile,
  useSubmitWithdrawal,
  useTaskHistory,
  useUserProfile,
} from "../hooks/useQueries";

const DAILY_GOAL_CENTS = 1000;

const TASK_DEFINITIONS = [
  {
    id: BigInt(1),
    name: "Watch Ad Video (60s)",
    description: "Watch a 60-second advertisement video to earn rewards.",
    rewardCents: BigInt(50),
    icon: Play,
    category: "video",
  },
  {
    id: BigInt(2),
    name: "Complete Survey",
    description: "Share your opinion in a quick 5-minute survey.",
    rewardCents: BigInt(200),
    icon: ClipboardList,
    category: "survey",
  },
  {
    id: BigInt(3),
    name: "Invite a Friend",
    description: "Refer a friend and earn when they join and verify.",
    rewardCents: BigInt(300),
    icon: UserPlus,
    category: "social",
  },
  {
    id: BigInt(4),
    name: "Play Mini Game",
    description: "Complete a fun mini game challenge to earn rewards.",
    rewardCents: BigInt(100),
    icon: Gamepad2,
    category: "game",
  },
  {
    id: BigInt(5),
    name: "Daily Quiz",
    description: "Answer 5 trivia questions correctly to claim your reward.",
    rewardCents: BigInt(150),
    icon: BookOpen,
    category: "quiz",
  },
  {
    id: BigInt(6),
    name: "Watch Tutorial",
    description: "Watch an educational tutorial video and earn.",
    rewardCents: BigInt(75),
    icon: Star,
    category: "video",
  },
  {
    id: BigInt(7),
    name: "Rate an App",
    description: "Rate and review an app on the app store.",
    rewardCents: BigInt(25),
    icon: SmartphoneNfc,
    category: "review",
  },
  {
    id: BigInt(8),
    name: "Fill Profile",
    description: "Complete your profile details to unlock bonus earnings.",
    rewardCents: BigInt(100),
    icon: UserCheck,
    category: "profile",
  },
];

const PAYMENT_METHODS = [
  { id: "paypal", label: "PayPal", icon: CreditCard },
  { id: "bank", label: "Bank Transfer", icon: Building2 },
  { id: "crypto", label: "Crypto", icon: Bitcoin },
];

function centsToUSD(cents: bigint | number): string {
  const n = typeof cents === "bigint" ? Number(cents) : cents;
  return `$${(n / 100).toFixed(2)}`;
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

function getTodayStart(): bigint {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return BigInt(d.getTime()) * BigInt(1_000_000);
}

export default function Dashboard() {
  const { identity, clear } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: leaderboard } = useLeaderboard();
  const { data: taskHistory } = useTaskHistory();
  const completeTask = useCompleteTask();
  const saveProfile = useSaveUserProfile();
  const submitWithdrawal = useSubmitWithdrawal();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "tasks" | "leaderboard" | "withdraw"
  >("dashboard");
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(
    new Set(),
  );
  const [selectedPayment, setSelectedPayment] = useState("paypal");
  const [profileNameInput, setProfileNameInput] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  const userName = profile?.name || "Earner";
  const balanceCents = profile?.balanceCents ?? BigInt(0);
  const totalEarnings = profile?.totalEarnings ?? BigInt(0);
  const streakCount = profile?.streakCount ?? BigInt(0);

  const todayStart = useMemo(() => getTodayStart(), []);

  const todayCompletions = useMemo(() => {
    if (!taskHistory) return new Set<string>();
    return new Set(
      taskHistory
        .filter((tc) => tc.completionDay >= todayStart)
        .map((tc) => tc.taskId.toString()),
    );
  }, [taskHistory, todayStart]);

  const todayEarnedCents = useMemo(() => {
    const completedIds = [...todayCompletions];
    return completedIds.reduce((sum, idStr) => {
      const task = TASK_DEFINITIONS.find((t) => t.id.toString() === idStr);
      return sum + (task ? Number(task.rewardCents) : 0);
    }, 0);
  }, [todayCompletions]);

  const dailyProgress = Math.min(
    (todayEarnedCents / DAILY_GOAL_CENTS) * 100,
    100,
  );
  const availableTasks = TASK_DEFINITIONS.filter(
    (t) => !todayCompletions.has(t.id.toString()),
  ).length;

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-4)}`
    : "";

  async function handleStartTask(taskId: bigint) {
    const key = taskId.toString();
    if (completingTasks.has(key) || todayCompletions.has(key)) return;

    setCompletingTasks((prev) => new Set([...prev, key]));
    const delay = 3000 + Math.random() * 2000;
    await new Promise((r) => setTimeout(r, delay));

    try {
      await completeTask.mutateAsync(taskId);
      const task = TASK_DEFINITIONS.find((t) => t.id === taskId);
      toast.success(
        `Task completed! +${centsToUSD(task?.rewardCents ?? BigInt(0))} earned`,
        {
          description: task?.name,
        },
      );
    } catch {
      toast.error("Failed to complete task. Try again.");
    } finally {
      setCompletingTasks((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  async function handleWithdraw() {
    if (!profile || Number(balanceCents) < DAILY_GOAL_CENTS) {
      toast.error("Minimum withdrawal is $10.00");
      return;
    }
    try {
      await submitWithdrawal.mutateAsync({
        amountCents: balanceCents,
        paymentMethod: selectedPayment,
      });
      toast.success("Withdrawal request submitted!", {
        description: `${centsToUSD(balanceCents)} will be sent via ${selectedPayment}.`,
      });
    } catch {
      toast.error("Withdrawal failed. Please try again.");
    }
  }

  async function handleSaveName() {
    if (!profileNameInput.trim() || !profile) return;
    try {
      await saveProfile.mutateAsync({
        ...profile,
        name: profileNameInput.trim(),
      });
      setShowNamePrompt(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  }

  const sortedLeaderboard = useMemo(() => {
    if (!leaderboard) return [];
    return [...leaderboard]
      .sort((a, b) => Number(b[1].totalEarnings) - Number(a[1].totalEarnings))
      .slice(0, 10);
  }, [leaderboard]);

  return (
    <div className="min-h-screen gradient-bg font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gold-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gold">EARN</span>
              <span className="text-foreground">DAILY</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {(["dashboard", "tasks", "leaderboard", "withdraw"] as const).map(
              (tab) => (
                <button
                  type="button"
                  key={tab}
                  data-ocid={`nav.${tab === "dashboard" ? "link" : tab === "tasks" ? "link" : tab === "leaderboard" ? "link" : "link"}`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    activeTab === tab
                      ? "bg-card text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  {tab}
                </button>
              ),
            )}
          </nav>

          {/* User chip */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-ocid="user.dropdown_menu"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg card-panel hover:border-gold/30 transition-colors"
              >
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="gold-gradient text-gold-foreground text-xs font-bold">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">
                  {userName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem
                data-ocid="user.edit_button"
                onClick={() => {
                  setProfileNameInput(userName);
                  setShowNamePrompt(true);
                }}
              >
                Edit Name
              </DropdownMenuItem>
              <DropdownMenuItem
                data-ocid="user.delete_button"
                onClick={clear}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile tab bar */}
        <div className="md:hidden flex border-t border-border/40">
          {(["dashboard", "tasks", "leaderboard", "withdraw"] as const).map(
            (tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "text-gold border-b-2 border-gold"
                    : "text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Name Prompt */}
        <AnimatePresence>
          {showNamePrompt && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 card-panel p-4 flex items-center gap-3"
            >
              <input
                data-ocid="profile.input"
                type="text"
                value={profileNameInput}
                onChange={(e) => setProfileNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                placeholder="Enter your name"
                className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
              />
              <Button
                data-ocid="profile.save_button"
                size="sm"
                onClick={handleSaveName}
                disabled={saveProfile.isPending}
                className="gold-gradient text-gold-foreground font-semibold"
              >
                {saveProfile.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                data-ocid="profile.cancel_button"
                size="sm"
                variant="ghost"
                onClick={() => setShowNamePrompt(false)}
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero / Welcome */}
            <div className="card-panel p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  {profileLoading ? (
                    <>
                      <Skeleton className="h-9 w-64 mb-2 bg-muted" />
                      <Skeleton className="h-5 w-48 bg-muted" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl sm:text-4xl font-extrabold">
                        Welcome back,{" "}
                        <span className="text-gold">{userName}</span>!
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        {shortPrincipal}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-2 border border-border self-start">
                  <Flame className="w-5 h-5 text-gold" />
                  <span className="text-gold font-bold text-lg">
                    {streakCount.toString()}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    day streak
                  </span>
                </div>
              </div>

              {/* Daily Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Daily Progress
                  </span>
                  <span className="text-sm font-bold">
                    <span className="text-gold">
                      {centsToUSD(todayEarnedCents)}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      / $10.00 goal
                    </span>
                  </span>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gold-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${dailyProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="mt-1.5 text-right text-xs text-muted-foreground">
                  {Math.round(dailyProgress)}% complete
                </div>
              </div>

              {/* 4 Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    icon: CheckCircle2,
                    label: "Completed Today",
                    value: todayCompletions.size.toString(),
                    color: "text-success",
                  },
                  {
                    icon: Clock,
                    label: "Available Tasks",
                    value: availableTasks.toString(),
                    color: "text-gold",
                  },
                  {
                    icon: Wallet,
                    label: "Balance",
                    value: centsToUSD(balanceCents),
                    color: "text-gold",
                  },
                  {
                    icon: TrendingUp,
                    label: "Total Earned",
                    value: centsToUSD(totalEarnings),
                    color: "text-success",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-muted/40 rounded-xl p-4 border border-border/50"
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                    <div className={`text-xl font-extrabold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Tasks + Earning Activities */}
              <div className="lg:col-span-2 space-y-8">
                {/* Task Grid */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Daily Tasks</h2>
                    <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">
                      {availableTasks} available
                    </Badge>
                  </div>
                  <div
                    data-ocid="tasks.list"
                    className="grid sm:grid-cols-2 gap-4"
                  >
                    {TASK_DEFINITIONS.map((task, idx) => {
                      const isCompleted = todayCompletions.has(
                        task.id.toString(),
                      );
                      const isRunning = completingTasks.has(task.id.toString());
                      return (
                        <motion.div
                          key={task.id.toString()}
                          data-ocid={`tasks.item.${idx + 1}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`card-panel p-5 flex flex-col gap-3 transition-colors ${
                            isCompleted ? "opacity-70" : "hover:border-gold/40"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isCompleted ? "bg-success/20" : "gold-gradient"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-success" />
                              ) : (
                                <task.icon className="w-5 h-5 text-gold-foreground" />
                              )}
                            </div>
                            <span className="text-gold font-bold text-sm">
                              {centsToUSD(task.rewardCents)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">
                              {task.name}
                            </h3>
                            <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          </div>
                          <Button
                            data-ocid={`tasks.button.${idx + 1}`}
                            size="sm"
                            disabled={isCompleted || isRunning}
                            onClick={() => handleStartTask(task.id)}
                            className={`w-full text-xs font-semibold mt-auto ${
                              isCompleted
                                ? "bg-success/20 text-success border border-success/30 cursor-default"
                                : "gold-gradient text-gold-foreground hover:opacity-90"
                            }`}
                          >
                            {isRunning ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{" "}
                                Processing...
                              </>
                            ) : isCompleted ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />{" "}
                                Completed
                              </>
                            ) : (
                              "Start Task"
                            )}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>

                {/* Earning Activities */}
                <section>
                  <h2 className="text-xl font-bold mb-4">Earning Activities</h2>
                  <div className="card-panel overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                            Task
                          </th>
                          <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                            Reward
                          </th>
                          <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {TASK_DEFINITIONS.map((task, idx) => {
                          const completed = todayCompletions.has(
                            task.id.toString(),
                          );
                          return (
                            <tr
                              key={task.id.toString()}
                              data-ocid={`activities.row.${idx + 1}`}
                              className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <task.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <span className="truncate">{task.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gold font-semibold">
                                {centsToUSD(task.rewardCents)}
                              </td>
                              <td className="px-4 py-3">
                                {completed ? (
                                  <Badge className="bg-success/20 text-success border-success/30 text-xs">
                                    Completed
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Pending
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {TASK_DEFINITIONS.length === 0 && (
                      <div
                        data-ocid="activities.empty_state"
                        className="px-4 py-8 text-center text-muted-foreground text-sm"
                      >
                        No activities yet. Start completing tasks!
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Leaderboard */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-gold" />
                    <h2 className="text-xl font-bold">Leaderboard</h2>
                  </div>
                  <div className="card-panel divide-y divide-border/40">
                    {sortedLeaderboard.length === 0 ? (
                      <div
                        data-ocid="leaderboard.empty_state"
                        className="px-4 py-6 text-center text-muted-foreground text-sm"
                      >
                        No data yet
                      </div>
                    ) : (
                      sortedLeaderboard.map(([principal, lProfile], idx) => {
                        const p = principal.toString();
                        const shortP = `${p.slice(0, 4)}...${p.slice(-3)}`;
                        const isMe = p === identity?.getPrincipal().toString();
                        return (
                          <div
                            key={p}
                            data-ocid={`leaderboard.item.${idx + 1}`}
                            className={`flex items-center gap-3 px-4 py-3 ${
                              isMe ? "bg-gold/10" : ""
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                idx === 0
                                  ? "gold-gradient text-gold-foreground"
                                  : idx === 1
                                    ? "bg-muted-foreground/40 text-foreground"
                                    : idx === 2
                                      ? "bg-card border border-border text-foreground"
                                      : "bg-muted/50 text-muted-foreground"
                              }`}
                            >
                              {idx === 0 ? (
                                <Medal className="w-3.5 h-3.5" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {lProfile.name || shortP}
                                {isMe && (
                                  <span className="ml-1 text-gold text-xs">
                                    (you)
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-gold font-bold text-sm flex-shrink-0">
                              {centsToUSD(lProfile.totalEarnings)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* Withdrawal */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-5 h-5 text-gold" />
                    <h2 className="text-xl font-bold">Withdraw</h2>
                  </div>
                  <div className="card-panel p-5 space-y-4">
                    <div className="text-center py-3 bg-muted/40 rounded-xl border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">
                        Available Balance
                      </div>
                      <div className="text-3xl font-extrabold text-gold">
                        {centsToUSD(balanceCents)}
                      </div>
                      {Number(balanceCents) < DAILY_GOAL_CENTS && (
                        <div className="text-xs text-muted-foreground mt-1">
                          $
                          {(
                            (DAILY_GOAL_CENTS - Number(balanceCents)) /
                            100
                          ).toFixed(2)}{" "}
                          more to unlock withdrawal
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Payment Method
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map((pm) => (
                          <button
                            type="button"
                            key={pm.id}
                            data-ocid={`withdraw.${pm.id}.toggle`}
                            onClick={() => setSelectedPayment(pm.id)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                              selectedPayment === pm.id
                                ? "border-gold bg-gold/10 text-gold"
                                : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                            }`}
                          >
                            <pm.icon className="w-4 h-4" />
                            {pm.label.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      data-ocid="withdraw.primary_button"
                      onClick={handleWithdraw}
                      disabled={
                        submitWithdrawal.isPending ||
                        Number(balanceCents) < DAILY_GOAL_CENTS
                      }
                      className="w-full gold-gradient text-gold-foreground font-bold glow-gold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitWithdrawal.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Processing...
                        </>
                      ) : (
                        "Withdraw Now"
                      )}
                    </Button>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">All Tasks</h2>
              <Badge className="bg-gold/20 text-gold border-gold/30">
                {availableTasks} remaining today
              </Badge>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {TASK_DEFINITIONS.map((task, idx) => {
                const isCompleted = todayCompletions.has(task.id.toString());
                const isRunning = completingTasks.has(task.id.toString());
                return (
                  <motion.div
                    key={task.id.toString()}
                    data-ocid={`all_tasks.item.${idx + 1}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`card-panel p-5 flex flex-col gap-3 ${
                      isCompleted ? "opacity-70" : "hover:border-gold/40"
                    } transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isCompleted ? "bg-success/20" : "gold-gradient"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-success" />
                        ) : (
                          <task.icon className="w-6 h-6 text-gold-foreground" />
                        )}
                      </div>
                      <span className="text-gold font-extrabold text-lg">
                        {centsToUSD(task.rewardCents)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{task.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                    <Button
                      data-ocid={`all_tasks.button.${idx + 1}`}
                      disabled={isCompleted || isRunning}
                      onClick={() => handleStartTask(task.id)}
                      className={`w-full font-semibold mt-auto ${
                        isCompleted
                          ? "bg-success/20 text-success border border-success/30"
                          : "gold-gradient text-gold-foreground hover:opacity-90"
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Processing...
                        </>
                      ) : isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Completed
                        </>
                      ) : (
                        "Start Task"
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-7 h-7 text-gold" />
              <h2 className="text-2xl font-bold">Community Leaderboard</h2>
            </div>
            <div className="card-panel overflow-hidden">
              {sortedLeaderboard.length === 0 ? (
                <div
                  data-ocid="leaderboard_tab.empty_state"
                  className="py-16 text-center text-muted-foreground"
                >
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No leaderboard data yet. Start completing tasks!</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {sortedLeaderboard.map(([principal, lProfile], idx) => {
                    const p = principal.toString();
                    const shortP = `${p.slice(0, 8)}...${p.slice(-5)}`;
                    const isMe = p === identity?.getPrincipal().toString();
                    return (
                      <motion.div
                        key={p}
                        data-ocid={`leaderboard_tab.item.${idx + 1}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center gap-4 px-6 py-4 ${
                          isMe
                            ? "bg-gold/10"
                            : idx % 2 === 0
                              ? "bg-muted/10"
                              : ""
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                            idx === 0
                              ? "gold-gradient text-gold-foreground"
                              : idx === 1
                                ? "bg-muted-foreground/30 text-foreground"
                                : idx === 2
                                  ? "bg-amber-800/40 text-amber-300"
                                  : "bg-muted/40 text-muted-foreground text-sm"
                          }`}
                        >
                          {idx === 0
                            ? "🥇"
                            : idx === 1
                              ? "🥈"
                              : idx === 2
                                ? "🥉"
                                : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">
                            {lProfile.name || shortP}
                            {isMe && (
                              <Badge className="ml-2 bg-gold/20 text-gold border-gold/30 text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            Streak: {lProfile.streakCount.toString()} days
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gold font-extrabold text-lg">
                            {centsToUSD(lProfile.totalEarnings)}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            total earned
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Withdraw Tab */}
        {activeTab === "withdraw" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="w-7 h-7 text-gold" />
              <h2 className="text-2xl font-bold">Withdraw Earnings</h2>
            </div>

            <div className="card-panel p-8 space-y-8">
              {/* Balance */}
              <div className="text-center">
                <div className="text-muted-foreground text-sm mb-2">
                  Available Balance
                </div>
                <div className="text-5xl font-extrabold text-gold mb-2">
                  {centsToUSD(balanceCents)}
                </div>
                <div className="text-muted-foreground text-sm">
                  {Number(balanceCents) >= DAILY_GOAL_CENTS
                    ? "✅ Ready to withdraw!"
                    : `Earn ${centsToUSD(DAILY_GOAL_CENTS - Number(balanceCents))} more to unlock withdrawal`}
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Progress to goal */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    Progress to $10 withdrawal minimum
                  </span>
                  <span className="text-gold font-medium">
                    {Math.min(
                      100,
                      Math.round(
                        (Number(balanceCents) / DAILY_GOAL_CENTS) * 100,
                      ),
                    )}
                    %
                  </span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gold-gradient rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, (Number(balanceCents) / DAILY_GOAL_CENTS) * 100)}%`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Payment Method */}
              <div>
                <div className="font-semibold mb-4">Select Payment Method</div>
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      type="button"
                      key={pm.id}
                      data-ocid={`withdraw_tab.${pm.id}.toggle`}
                      onClick={() => setSelectedPayment(pm.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedPayment === pm.id
                          ? "border-gold bg-gold/10 text-gold glow-gold"
                          : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}
                    >
                      <pm.icon className="w-6 h-6" />
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                data-ocid="withdraw_tab.primary_button"
                size="lg"
                onClick={handleWithdraw}
                disabled={
                  submitWithdrawal.isPending ||
                  Number(balanceCents) < DAILY_GOAL_CENTS
                }
                className="w-full gold-gradient text-gold-foreground font-bold text-lg py-7 glow-gold hover:opacity-90 disabled:opacity-50"
              >
                {submitWithdrawal.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing
                    Withdrawal...
                  </>
                ) : (
                  `Withdraw ${centsToUSD(balanceCents)} via ${PAYMENT_METHODS.find((p) => p.id === selectedPayment)?.label}`
                )}
              </Button>

              {submitWithdrawal.isSuccess && (
                <div
                  data-ocid="withdraw.success_state"
                  className="text-center p-4 bg-success/10 rounded-xl border border-success/30"
                >
                  <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-success font-semibold">
                    Withdrawal Submitted!
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Your funds will arrive within 1-3 business days.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex gap-4">
              <a
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </a>
              <a
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                FAQ
              </a>
              <a
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
            </div>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              © {new Date().getFullYear()} Built with ❤️ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
