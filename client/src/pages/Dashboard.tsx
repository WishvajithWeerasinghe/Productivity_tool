import TaskBoard from "../components/TaskBoard";
import PomodoroTimer from "../components/PomodoroTimer";
import Journal from "../components/Journal";
import AppHeader from "../components/AppHeader";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AppHeader />

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
