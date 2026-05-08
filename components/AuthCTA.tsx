"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Wallet, Mail, ArrowRight } from "lucide-react";

/**
 * Botón de autenticación que se adapta al modo:
 * - Si NEXT_PUBLIC_PRIVY_APP_ID está configurado → activa Privy login modal
 * - Si NO → navega a /home en modo demo (mocks honestos)
 *
 * Visualmente igual en ambos casos para que la jury vea un flujo coherente.
 */
type Variant = "primary" | "compact";

export function AuthCTA({
  variant = "primary",
  label,
}: {
  variant?: Variant;
  label?: string;
}) {
  const [hasPrivy, setHasPrivy] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasPrivy(Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID));
  }, []);

  // Mientras hidrata, mostramos versión demo (evita flash)
  if (!mounted || !hasPrivy) {
    return (
      <DemoButton variant={variant} label={label ?? "Empezar con email"} />
    );
  }

  return <PrivyButton variant={variant} label={label ?? "Empezar con email"} />;
}

/**
 * Versión demo — solo navega a /home con banner explícito
 */
function DemoButton({ variant, label }: { variant: Variant; label: string }) {
  if (variant === "primary") {
    return (
      <Link
        href="/home"
        className="btn-primary inline-flex items-center gap-2"
        title="Modo demo — sin Privy configurado, navega a /home con datos simulados"
      >
        <Mail className="size-4" strokeWidth={2} aria-hidden="true" />
        {label}
        <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <Link
      href="/home"
      className="rounded-full border border-tropico-sun/40 bg-tropico-sun/10 px-3 py-1 text-xs font-semibold text-tropico-sun transition hover:bg-tropico-sun/20"
    >
      Abrir app
    </Link>
  );
}

/**
 * Versión Privy — activa el modal de login con email
 *
 * Se importa dinámicamente solo cuando se necesita para evitar
 * inflar el bundle si no hay Privy configurado.
 */
function PrivyButton({ variant, label }: { variant: Variant; label: string }) {
  const [LoginButton, setLoginButton] = useState<React.ComponentType | null>(
    null
  );

  useEffect(() => {
    // Lazy load de Privy SDK solo si está configurado
    import("@privy-io/react-auth").then(({ usePrivy }) => {
      const Component = () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { login, authenticated, ready } = usePrivy();

        if (!ready) {
          return (
            <button
              disabled
              className={
                variant === "primary"
                  ? "btn-primary opacity-60"
                  : "rounded-full border border-tropico-sun/40 bg-tropico-sun/10 px-3 py-1 text-xs font-semibold text-tropico-sun"
              }
            >
              Cargando…
            </button>
          );
        }

        if (authenticated) {
          // Ya logueado, llevarlo al home
          if (variant === "primary") {
            return (
              <Link
                href="/home"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Wallet
                  className="size-4"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Abrir mi Tropico
                <ArrowRight
                  className="size-4"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </Link>
            );
          }
          return (
            <Link
              href="/home"
              className="rounded-full border border-tropico-sun/40 bg-tropico-sun/10 px-3 py-1 text-xs font-semibold text-tropico-sun"
            >
              Mi Tropico
            </Link>
          );
        }

        // No logueado: trigger login modal
        if (variant === "primary") {
          return (
            <button
              onClick={login}
              className="btn-primary inline-flex items-center gap-2"
            >
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
            Crear wallet
          </button>
        );
      };
      setLoginButton(() => Component);
    });
  }, [variant, label]);

  if (!LoginButton) {
    // mientras carga el SDK, mostramos un placeholder
    return <DemoButton variant={variant} label={label} />;
  }

  return <LoginButton />;
}
