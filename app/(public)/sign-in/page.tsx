
"use client";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else window.location.href = "/home";
  }
  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold">Anmelden</h1>
      <form onSubmit={onSubmit} className="space-y-3 mt-4">
        <input required placeholder="E-Mail" value={email} onChange={e=>setEmail(e.target.value)} className="border p-2 w-full" />
        <input required placeholder="Passwort" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="border p-2 w-full" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-black text-white px-4 py-2 rounded">Login</button>
      </form>
    </main>
  );
}
