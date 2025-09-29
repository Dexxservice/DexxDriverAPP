import { createClient } from "@/lib/supabase/server";
import StopForm from "./stop-form";

export default async function StopPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: stop, error } = await supabase
    .from("route_stops")
    .select(
      "id, status, route_id, pickup_orders(address_line1, city, postal_code)"
    )
    .eq("id", params.id)
    .single();

  if (error || !stop) {
    return <div className="p-6">Stop nicht gefunden.</div>;
  }

  // kann Array oder Objekt sein -> erstes Element nehmen
  const addr = Array.isArray(stop.pickup_orders)
    ? stop.pickup_orders[0]
    : stop.pickup_orders;

  return (
    <main className="p-6">
      <h1 className="text-xl mb-2">Stop</h1>
      <p className="text-sm text-gray-600">
        {addr?.address_line1}, {addr?.postal_code} {addr?.city}
      </p>
      <StopForm routeStopId={stop.id} />
    </main>
  );
}
