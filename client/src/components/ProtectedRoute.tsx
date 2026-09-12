import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useAuth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) return <p className="text-center mt-20 text-slate-400">Loading…</p>;
  if (isError || !user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
