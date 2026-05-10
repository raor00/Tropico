"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Mail, ArrowRight, Cpu } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

/**
 * Botón de autenticación.
 * - Si NEXT_PUBLIC_PRIVY_APP_ID está seteado → PrivyButton (modal login email/google/wallet)
 * - Si NO → DemoButton (modo dev local con keypair efímero)
 *
 * El gate es a nivel módulo (const) para que se inline en build, sin flash de
 * fallback durante hidratación. Cuando PRIVY_ENABLED=true, PrivyProvider
 * está siempre montado en providers.tsx, así que usePrivy() es llamable.
 */
const PRIVY_ENABLED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

type Variant = "primary" | "compact";

export function AuthCTA({
  variant = "primary",
  label,
}: {
  variant?: Variant;
  label?: string;
}) {
  if (PRIVY_ENABLED) {
    return <PrivyButton variant={variant} label={label ?? "Empezar con email"} />;
  }
  return <DemoButton variant={variant} label={label ?? "Empezar con email"} />;
}

/**
 * Versión demo — navega a /home con banner explícito + botón Modo dev
 */
function DemoButton({ variant, label }: { variant: Variant; label: string }) {
  const router = useRouter();
  const [devLoading, setDevLoading] = useState(false);

  async function activarModoDev() {
    setDevLoading(true);
    try {
      // Generar keypair efímero on-browser via @solana/web3.js
      const { Keypair } = await import("@solana/web3.js");
      const kp = Keypair.generate();
      localStorage.setItem(
        "tropico:dev-wallet",
        JSON.stringify({
          publicKey: kp.publicKey.toBase58(),
          // secretKey como array de numbers para evitar depender de bs58 en browser
          secretKey: Array.from(kp.secretKey),
          createdAt: new Date().toISOString(),
          network: "devnet",
        })
      );
      router.push("/home");
    } catch {
      // Fallback: mock pubkey aleatorio si @solana/web3.js no carga en browser
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      const mockPubkey = Array.from(randomBytes, (b) =>
        b.toString(16).padStart(2, "0")
      ).join("");
      localStorage.setItem(
        "tropico:dev-wallet",
        JSON.stringify({
          publicKey: mockPubkey,
          secretKey: null,
          createdAt: new Date().toISOString(),
          network: "devnet",
        })
      );
      router.push("/home");
    } finally {
      setDevLoading(false);
    }
  }

  // 3 estados: no-wallet · has-wallet-locked · unlocked
  // unlocked = sessionStorage flag set después de password unlock o create
  const [walletState, setWalletState] = useState<"none" | "locked" | "unlocked">("none");
  useEffect(() => {
    const has = localStorage.getItem("tropico:wallet:v1") !== null;
    const unlocked = sessionStorage.getItem("tropico:wallet:unlocked") === "1";
    const dev = localStorage.getItem("tropico:dev-wallet") !== null;
    if (has && unlocked) setWalletState("unlocked");
    else if (has) setWalletState("locked");
    else if (dev) setWalletState("unlocked"); // dev wallet siempre "unlocked"
    else setWalletState("none");
  }, []);

  // Resolver href + label según estado
  const cta = (() => {
    if (walletState === "unlocked") {
      return { href: "/perfil", label: "Mi Tropico", labelCompact: "Mi Tropico" };
    }
    if (walletState === "locked") {
      return { href: "/wallet/abrir", label: "Desbloquear wallet", labelCompact: "Abrir wallet" };
    }
    return { href: "/wallet/crear", label: "Crear mi wallet (in-app)", labelCompact: "Crear wallet" };
  })();

  if (variant === "primary") {
    return (
      <div className="flex flex-col items-stretch gap-2">
        <Link
          href={cta.href}
          className="btn-primary inline-flex items-center gap-2"
          title="100% non-custodial — wallet en este navegador, encriptada con tu password"
        >
          <Mail className="size-4" strokeWidth={2} aria-hidden="true" />
          {cta.label}
          <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
        </Link>
        {/* Modo dev solo aparece si no hay wallet aún (no tiene sentido si ya estás dentro) */}
        {walletState === "none" && (
          <button
            onClick={activarModoDev}
            disabled={devLoading}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-tropico-mute transition hover:text-tropico-purple disabled:opacity-60"
            title="Genera un keypair efímero en devnet — solo para pruebas"
          >
            <Cpu className="size-3" aria-hidden="true" />
            {devLoading ? "Generando keypair…" : "Modo dev rápido (devnet, sin password)"}
          </button>
        )}
      </div>
    );
  }

  // Compact (Header) — mobile/md: icon-only redondo. lg+: con label.
  // Esto evita que ocupe demasiado ancho en md cuando compite con el nav.
  const Icon = walletState === "unlocked" ? Wallet : Mail;
  return (
    <Link
      href={cta.href}
      title={cta.labelCompact}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border text-xs font-semibold transition size-9 justify-center lg:size-auto lg:px-3 lg:py-1.5 ${
        walletState === "unlocked"
          ? "border-tropico-sea/40 bg-tropico-sea/10 text-tropico-sea hover:bg-tropico-sea/20"
          : "border-tropico-sun/40 bg-tropico-sun/10 text-tropico-sun hover:bg-tropico-sun/20"
      }`}
    >
      <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
      <span className="hidden lg:inline whitespace-nowrap">{cta.labelCompact}</span>
    </Link>
  );
}

function PrivyButton({ variant, label }: { variant: Variant; label: string }) {
  const { login, authenticated, ready } = usePrivy();

  if (!ready) {
    return (
      <button
        disabled
        className={
          variant === "primary"
            ? "btn-primary opacity-60"
            : "rounded-full border border-tropico-sun/40 bg-tropico-sun/10 px-3 py-1 text-xs font-semibold text-tropico-sun opacity-60"
        }
      >
        Cargando…
      </button>
    );
  }

  if (authenticated) {
    if (variant === "primary") {
      return (
        <Link
          href="/perfil"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Wallet className="size-4" strokeWidth={2} aria-hidden="true" />
          Mi Tropico
          <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
        </Link>
      );
    }
    return (
      <Link
        href="/perfil"
        className="rounded-full border border-tropico-sun/40 bg-tropico-sun/10 px-3 py-1 text-xs font-semibold text-tropico-sun"
      >
        Mi Tropico
      </Link>
    );
  }

  // No logueado: trigger Privy modal con email/google/wallet
  if (variant === "primary") {
    return (
      <button onClick={login} className="btn-primary inline-flex items-center gap-2">
        <Mail className="size-4" strokeWidth={2} aria-hidden="true" />
        {label}
        <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="rounded-full border border-tropico-sun/40 bg-tropico-sun/10 px-3 py-1 text-xs font-semibold text-tropico-sun transition hover:bg-tropico-sun/20"
    >
      Iniciar sesión
    </button>
  );
}
