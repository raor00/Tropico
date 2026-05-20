import { Suspense } from "react";
import { PropertyView } from "./PropertyView";

type Props = { params: Promise<{ id: string }> };

export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center">
          <span className="text-tropico-mute text-sm animate-pulse">
            Cargando inmueble…
          </span>
        </main>
      }
    >
      <PropertyView id={id} />
    </Suspense>
  );
}
