import { useCurrentUser, useLogout } from "../hooks/useAuth";
import TaskBoard from "../components/TaskBoard";
import PomodoroTimer from "../components/PomodoroTimer";
import Journal from "../components/Journal";

export default function Dashboard() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">DevFlow</h1>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">{user?.name}</span>
          <button
            onClick={() => logout.mutate()}
            className="text-sm px-3 py-1 rounded bg-slate-800 hover:bg-slate-700"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskBoard />
        </div>
        <div className="space-y-6">
          <PomodoroTimer />
          <Journal />
        </div>
      </div>
    </div>
  );
}
