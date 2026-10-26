import TaskBoard from "../components/TaskBoard";
import PomodoroTimer from "../components/PomodoroTimer";
import PlaylistPlayer from "../components/PlaylistPlayer";
import AppHeader from "../components/AppHeader";
import DashboardClock from "../components/DashboardClock";
import { useCurrentUser } from "../hooks/useAuth";

export default function Dashboard() {
  const { data: user } = useCurrentUser();

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <AppHeader />

      <section className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          {/*<p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">workspace</p>*/}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Hi {user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Keep your priorities in view and make a little progress at a time.
          </p>
        </div>
        <DashboardClock />
      </section>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="solid-surface surface min-w-0 p-4 sm:p-6">
          <TaskBoard />
        </section>
        <aside className="space-y-5">
          <PomodoroTimer />
          {user && <PlaylistPlayer key={user.id} userId={user.id} />}
        </aside>
      </div>
    </main>
  );
}
