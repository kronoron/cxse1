"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
    if ((res as any)?.error) setError((res as any).error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 p-6 rounded-lg bg-zinc-900">
        <h1 className="text-2xl font-semibold">Sign in to CxSE</h1>
        <input
          className="w-full rounded bg-zinc-800 p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded bg-zinc-800 p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="w-full bg-green-500 text-black rounded p-2 font-medium" type="submit">
          Sign In
        </button>
      </form>
    </div>
  );
}


