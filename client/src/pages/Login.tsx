import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      navigate("/");
    } catch {
      // error surfaced via login.isError below
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-slate-900 p-8 rounded-xl space-y-4">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        {login.isError && <p className="text-red-400 text-sm">Invalid email or password.</p>}
        <button
          type="submit"
          disabled={login.isPending}
          className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
        >
          {login.isPending ? "Logging in..." : "Log in"}
        </button>
        <p className="text-sm text-slate-400">
          No account? <Link to="/register" className="text-indigo-400">Register</Link>
        </p>
      </form>
    </div>
  );
}
