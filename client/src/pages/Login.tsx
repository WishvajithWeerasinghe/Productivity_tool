import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import logo from "../assets/logo.png";

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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface grid w-full max-w-4xl overflow-hidden md:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white md:flex">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
          <Link to="/" className="relative flex items-center gap-2.5 text-xl font-bold tracking-tight">
            <img src={logo} alt="" className="h-9 w-9 rounded-xl object-contain" />
            DevFlow
          </Link>
          <div className="relative">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Make room for focus</p>
            <h2 className="text-4xl font-semibold leading-tight">Small steps.<br />Meaningful progress.</h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">Your tasks, focus sessions, and notes—together in one calm workspace.</p>
          </div>
          <p className="relative text-xs text-slate-400">A better day starts with one clear next step.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-7 sm:p-10">
          <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 md:hidden">
            <img src={logo} alt="" className="h-9 w-9 rounded-xl object-contain" />
            DevFlow
          </Link>
          <div className="mb-8 md:mb-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Welcome back</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Log in to DevFlow</h1>
            <p className="mt-2 text-sm text-slate-500">Pick up right where you left off.</p>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field mt-2 w-full px-3.5 py-3 text-sm"
              autoComplete="email"
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field mt-2 w-full px-3.5 py-3 text-sm"
              autoComplete="current-password"
              required
            />
          </label>
          {login.isError && <p role="alert" className="text-sm text-rose-600">Invalid email or password.</p>}
          <button type="submit" disabled={login.isPending} className="button-primary w-full py-3 text-sm">
            {login.isPending ? "Logging in..." : "Log in"}
          </button>
          <p className="pt-2 text-center text-sm text-slate-500">
            No account? <Link to="/register" className="font-semibold text-violet-700 hover:text-violet-800">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
