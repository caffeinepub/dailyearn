import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Task = {
    id : Nat;
    name : Text;
    description : Text;
    rewardCents : Nat;
  };

  public type UserProfile = {
    name : Text;
    balanceCents : Nat;
    streakCount : Nat;
    totalEarnings : Nat;
    lastTaskCompletionDay : ?Time.Time;
  };

  module UserProfile {
    public func compareByTotalBalance(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Nat.compare(p2.balanceCents, p1.balanceCents);
    };
  };

  type TaskCompletion = {
    taskId : Nat;
    completionDay : Time.Time;
  };

  type WithdrawalRequest = {
    amountCents : Nat;
    paymentMethod : Text;
    requestedAt : Time.Time;
    processed : Bool;
  };

  let tasks = Map.empty<Nat, Task>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let taskCompletions = Map.empty<Principal, [TaskCompletion]>();
  let withdrawalRequests = Map.empty<Principal, [WithdrawalRequest]>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Required user profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func completeTask(taskId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete tasks");
    };

    let currentDay = Time.now() / (24 * 3600 * 1000000000);
    let todayStart = currentDay * 24 * 3600 * 1000000000;

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task does not exist") };
      case (?t) { t };
    };

    let userProfile = switch (userProfiles.get(caller)) {
      case (null) {
        let newProfile : UserProfile = {
          name = "";
          balanceCents = task.rewardCents;
          streakCount = 1;
          totalEarnings = task.rewardCents;
          lastTaskCompletionDay = ?todayStart;
        };
        userProfiles.add(caller, newProfile);
        newProfile;
      };
      case (?profile) {
        if (profile.lastTaskCompletionDay == ?todayStart) {
          Runtime.trap("Task already completed today");
        };

        let updatedProfile : UserProfile = {
          profile with
          balanceCents = profile.balanceCents + task.rewardCents;
          streakCount = if (profile.lastTaskCompletionDay == ?(todayStart - 24 * 3600 * 1000000000)) {
            profile.streakCount + 1;
          } else {
            1;
          };
          totalEarnings = profile.totalEarnings + task.rewardCents;
          lastTaskCompletionDay = ?todayStart;
        };
        userProfiles.add(caller, updatedProfile);
        updatedProfile;
      };
    };

    let newCompletion : TaskCompletion = {
      taskId;
      completionDay = todayStart;
    };

    let existingCompletions = switch (taskCompletions.get(caller)) {
      case (null) { [] };
      case (?completions) { completions };
    };
    taskCompletions.add(caller, existingCompletions.concat([newCompletion]));
  };

  public shared ({ caller }) func submitWithdrawalRequest(amountCents : Nat, paymentMethod : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit withdrawal requests");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?p) { p };
    };

    if (profile.balanceCents < amountCents) {
      Runtime.trap("Insufficient balance");
    };

    let updatedProfile : UserProfile = {
      profile with
      balanceCents = profile.balanceCents - amountCents;
    };
    userProfiles.add(caller, updatedProfile);

    let newRequest : WithdrawalRequest = {
      amountCents;
      paymentMethod;
      requestedAt = Time.now();
      processed = false;
    };

    let existingRequests = switch (withdrawalRequests.get(caller)) {
      case (null) { [] };
      case (?requests) { requests };
    };
    withdrawalRequests.add(caller, existingRequests.concat([newRequest]));
  };

  public query ({ caller }) func getLeaderboard() : async [(Principal, UserProfile)] {
    // Leaderboard is public - no authorization needed
    let entries = userProfiles.entries().toArray();
    entries.sort(
      func(a, b) {
        switch (UserProfile.compareByTotalBalance(a.1, b.1)) {
          case (#equal) { Nat.compare(b.1.streakCount, a.1.streakCount) };
          case (order) { order };
        };
      }
    );
  };

  public query ({ caller }) func getUserTaskHistory(user : Principal) : async [TaskCompletion] {
    // Users can only view their own history, admins can view any
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own task history");
    };

    switch (taskCompletions.get(user)) {
      case (null) { [] };
      case (?completions) { completions };
    };
  };

  public query ({ caller }) func getTasksByIds(taskIds : [Nat]) : async [Task] {
    // Public function - anyone can view tasks
    taskIds.map(
      func(id) {
        switch (tasks.get(id)) {
          case (null) { Runtime.trap("Task with id " # Nat.toText(id) # " not found!") };
          case (?task) { task };
        };
      }
    );
  };

  // Add new pre-defined task (admin only)
  public shared ({ caller }) func addTask(name : Text, description : Text, rewardCents : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add tasks");
    };

    let newId = tasks.size() + 1;
    let newTask : Task = {
      id = newId;
      name;
      description;
      rewardCents;
    };
    tasks.add(newId, newTask);
  };

  // Complete a predefined task (user only)
  public shared ({ caller }) func completeTaskById(taskId : Nat) : async () {
    await completeTask(taskId);
  };
};
