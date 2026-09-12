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
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-slate-900 p-8 rounded-xl space-y-4">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
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
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          required
          minLength={6}
        />
        {register.isError && <p className="text-red-400 text-sm">Could not create account.</p>}
        <button
          type="submit"
          disabled={register.isPending}
          className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
        >
          {register.isPending ? "Creating..." : "Create account"}
        </button>
        <p className="text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-indigo-400">Log in</Link>
        </p>
      </form>
    </div>
  );
}
