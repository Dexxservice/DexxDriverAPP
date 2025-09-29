
"use client";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import SignatureCanvas from "react-signature-canvas";

export default function StopForm({ routeStopId }: { routeStopId: string }) {
  const [L, setL] = useState<number>(0);
  const [W, setW] = useState<number>(0);
  const [H, setH] = useState<number>(0);
  const [weight, setWeight] = useState<number | undefined>();
  const [recipient, setRecipient] = useState(""); const [phone, setPhone] = useState(""); const [price, setPrice] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const sigRef = useRef<SignatureCanvas>(null);

  function previewPrice() {
    let p = 59; const over = Math.max(0, L-60, W-40, H-40);
    if (over > 0) p += Math.ceil(over/10)*10;
    const volume_m3 = (L*W*H)/1_000_000;
    if (volume_m3 > 0.2) p += (volume_m3 - 0.2) * 120;
    setPrice(Math.round(p*100)/100);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setUploading(True);
  }
}
