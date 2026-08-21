import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline" };

export default function OfflinePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <WifiOff className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      <h1 className="font-display text-xl font-bold">Jsi offline</h1>
      <p className="max-w-sm text-muted-foreground">
        Tuto stránku jsi ještě nenavštívil/a, takže není uložená pro offline použití. Zkontroluj připojení k
        internetu a zkus to znovu.
      </p>
    </main>
  );
}
