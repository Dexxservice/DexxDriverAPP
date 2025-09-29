
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";
export default async function Today() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-6">Bitte einloggen.</div>;
  const today = new Date().toISOString().slice(0,10);
  const { data: route } = await supabase.from("routes").select("id, status").eq("driver_id", user.id).eq("route_date", today).single();
  if (!route) return <div className="p-6">Heute ({format(new Date(), "dd.MM.yyyy")}) keine Tour zugewiesen.</div>;
  const { data: stops } = await supabase.from("route_stops").select("id, stop_index, status, pickup_orders!inner(address_line1, postal_code, city)").eq("route_id", route.id).order("stop_index", { ascending: true });
  return (
    <main className="p-6">
      <h1 className="text-xl mb-4">Meine Tour – {format(new Date(), "dd.MM.yyyy")}</h1>
      <ul className="space-y-3">
        {(stops ?? []).map((s:any)=>(
          <li key={s.id} className="border p-3 rounded">
            <div className="text-sm text-gray-600">Stop {s.stop_index+1} – {s.status}</div>
            <div className="font-medium">{s.pickup_orders.address_line1}, {s.pickup_orders.postal_code} {s.pickup_orders.city}</div>
            <Link className="underline text-sm" href={`/driver/stop/${s.id}`}>Details</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
