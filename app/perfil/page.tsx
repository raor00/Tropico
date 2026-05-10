import { ProfileView } from "@/components/ProfileView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mi perfil — Tropico",
  description: "Tu perfil en Tropico Wallet",
};

export default function PerfilPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-5 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-tropico-mute">
          Datos de tu wallet, ajustes y zona de peligro.
        </p>
      </header>
      <ProfileView />
    </main>
  );
}
