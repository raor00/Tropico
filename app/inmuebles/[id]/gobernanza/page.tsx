import { Suspense } from "react";
import { GobernanzaView } from "./GobernanzaView";

type Props = { params: Promise<{ id: string }> };

export default async function GobernanzaPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center">
          <span className="text-tropico-mute text-sm animate-pulse">Cargando gobernanza…</span>
        </main>
      }
    >
      <GobernanzaView propertyId={id} />
    </Suspense>
  );
}
