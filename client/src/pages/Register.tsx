import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "../hooks/useAuth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const register = useRegister();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await register.mutateAsync({ name, email, password });
      navigate("/");
    } catch {
      // error surfaced via register.isError below
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface grid w-full max-w-4xl overflow-hidden md:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white md:flex">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
          <Link to="/" className="relative flex items-center gap-2.5 text-xl font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500 text-sm">D</span>
            DevFlow
          </Link>
          <div className="relative">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Your work, in rhythm</p>
            <h2 className="text-4xl font-semibold leading-tight">Build a routine<br />that works for you.</h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">Bring your daily plan into focus and celebrate every bit of progress.</p>
          </div>
          <p className="relative text-xs text-slate-400">One workspace for the work that matters.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-7 sm:p-10">
          <div className="mb-8 md:mb-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Get started</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
            <p className="mt-2 text-sm text-slate-500">Set up your space and get in the flow.</p>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Your name
            <input
              type="text"
              placeholder="Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field mt-2 w-full px-3.5 py-3 text-sm"
              autoComplete="name"
              required
            />
          </label>
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field mt-2 w-full px-3.5 py-3 text-sm"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </label>
          {register.isError && <p role="alert" className="text-sm text-rose-600">Could not create account.</p>}
          <button type="submit" disabled={register.isPending} className="button-primary w-full py-3 text-sm">
            {register.isPending ? "Creating..." : "Create account"}
          </button>
          <p className="pt-2 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-violet-700 hover:text-violet-800">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
