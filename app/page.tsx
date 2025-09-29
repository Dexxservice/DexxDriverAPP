
import Link from "next/link";
export default function Page() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">DexCargo</h1>
      <p className="mt-2">Weiter zu <Link className="underline" href="/home">Home</Link> oder <Link className="underline" href="/sign-in">Login</Link>.</p>
    </main>
  );
}
