
import { createClient } from "@/lib/supabase/server";
import StopForm from "./stop-form";
export default async function StopPage({ params }: { params: { id: string }}) {
  const supabase = createClient();
  const { data: stop } = await supabase.from("route_stops").select("id, status, pickup_orders(address_line1, city, postal_code), route_id").eq("id", params.id).single();
  if (!stop) return <div className="p-6">Stop nicht gefunden.</div>;
  return (
    <main className="p-6">
      <h1 className="text-xl mb-2">Stop</h1>
      <p className="text-sm text-gray-600">{stop.pickup_orders.address_line1}, {stop.pickup_orders.postal_code} {stop.pickup_orders.city}</p>
      <StopForm routeStopId={stop.id} />
    </main>
  );
}
