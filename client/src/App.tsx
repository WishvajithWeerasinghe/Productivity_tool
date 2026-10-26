import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MeetingNotes from "./pages/MeetingNotes";
import JournalPage from "./pages/JournalPage";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkspaceLayout from "./components/WorkspaceLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><WorkspaceLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/meeting-notes" element={<MeetingNotes />} />
      </Route>
    </Routes>
  );
}
