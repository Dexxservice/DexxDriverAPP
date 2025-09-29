
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-6">Nicht eingeloggt. <Link href="/sign-in" className="underline">Login</Link></div>;
  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  if (!profile) return <div className="p-6">Kein Profil gefunden.</div>;
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl">Hallo {profile.full_name ?? "Driver"}</h1>
      {profile.role === "admin" || profile.role === "dispatcher" ? (
        <div className="space-x-4">
          <Link href="/admin/orders" className="underline">Admin: Aufträge</Link>
          <Link href="/admin/routes" className="underline">Admin: Touren</Link>
        </div>
      ) : (
        <div className="space-x-4">
          <Link href="/driver/today" className="underline">Meine Tour (Heute)</Link>
        </div>
      )}
    </main>
  );
}
