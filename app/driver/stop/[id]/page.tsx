"use client";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import SignatureCanvas from "react-signature-canvas";

export default function StopForm({ routeStopId }: { routeStopId: string }) {
  const [L, setL] = useState<number>(0);
  const [W, setW] = useState<number>(0);
  const [H, setH] = useState<number>(0);
  const [weight, setWeight] = useState<number | undefined>();
  const [recipient, setRecipient] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const sigRef = useRef<SignatureCanvas>(null);

  function previewPrice() {
    let p = 59;
    const over = Math.max(0, L - 60, W - 40, H - 40);
    if (over > 0) p += Math.ceil(over / 10) * 10;
    const volume_m3 = (L * W * H) / 1_000_000;
    if (volume_m3 > 0.2) p += (volume_m3 - 0.2) * 120;
    setPrice(Math.round(p * 100) / 100);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht eingeloggt");

      // Signatur → PNG → Storage
      let signature_url: string | null = null;
      if (sigRef.current && !sigRef.current.isEmpty()) {
        const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
        const binStr = atob(dataUrl.split(",")[1]);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
        const path = `${user.id}/${routeStopId}-${Date.now()}.png`;
        const { data: up, error: upErr } = await supabase.storage
          .from("signatures")
          .upload(path, bytes, { contentType: "image/png" });
        if (upErr) throw upErr;
        signature_url = up?.path ?? null;
      }

      // finaler Preis (wie Vorschau)
      let p = 59;
      const over = Math.max(0, L - 60, W - 40, H - 40);
      if (over > 0) p += Math.ceil(over / 10) * 10;
      const volume_m3 = (L * W * H) / 1_000_000;
      if (volume_m3 > 0.2) p += (volume_m3 - 0.2) * 120;
      p = Math.round(p * 100) / 100;

      const { error: insErr } = await supabase.from("stop_documents").insert({
        route_stop_id: routeStopId,
        length_cm: L,
        width_cm: W,
        height_cm: H,
        weight_kg: weight ?? null,
        recipient_name: recipient,
        recipient_phone: phone,
        signature_url,
        photos_url: [],
        price_eur: p,
      });
      if (insErr) throw insErr;

      alert("Gespeichert.");
      window.history.back();
    } catch (err: any) {
      alert("Fehler: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function uploadPhoto(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const path = `${user.id}/${routeStopId}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("photos").upload(path, file);
    if (error) alert("Upload-Fehler: " + error.message);
    else alert("Foto hochgeladen");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 mt-4">
      <div className="grid grid-cols-3 gap-2">
        <input type="number" placeholder="Länge (cm)" value={L || ""} onChange={e => setL(parseInt(e.target.value || "0"))} className="border p-2" />
        <input type="number" placeholder="Breite (cm)" value={W || ""} onChange={e => setW(parseInt(e.target.value || "0"))} className="border p-2" />
        <input type="number" placeholder="Höhe (cm)" value={H || ""} onChange={e => setH(parseInt(e.target.value || "0"))} className="border p-2" />
      </div>

      <input type="number" step="0.1" placeholder="Gewicht (kg, optional)" value={weight ?? ""} onChange={e => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)} className="border p-2 w-full" />

      <div className="flex items-center gap-2">
        <button type="button" onClick={previewPrice} className="border px-3 py-2 rounded">Preisvorschau</button>
        {price !== null && <span className="font-semibold">Vorschau: {price.toFixed(2)} €</span>}
      </div>

      <input placeholder="Empfänger Name" value={recipient} onChange={e => setRecipient(e.target.value)} className="border p-2 w-full" />
      <input placeholder="Telefon" value={phone} onChange={e => setPhone(e.target.value)} className="border p-2 w-full" />

      <div>
        <label className="block text-sm mb-1">Unterschrift</label>
        <SignatureCanvas ref={sigRef} canvasProps={{ width: 320, height: 120, className: "border rounded" }} />
      </div>

      <div>
        <label className="block text-sm mb-1">Foto(s) aufnehmen/hochladen</label>
        <input type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
      </div>

      <button disabled={uploading} className="bg-black text-white px-4 py-2 rounded">
        {uploading ? "Speichern..." : "Stop abschließen"}
      </button>
    </form>
  );
}
