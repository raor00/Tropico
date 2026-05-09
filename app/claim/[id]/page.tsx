import { Suspense } from "react";
import { ClaimView } from "./ClaimView";

type Props = { params: Promise<{ id: string }> };

export default async function ClaimPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center">
          <span className="text-tropico-mute text-sm animate-pulse">Cargando…</span>
        </main>
      }
    >
      <ClaimView id={id} />
    </Suspense>
  );
}
