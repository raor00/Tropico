import Link from "next/link";
import { Header } from "@/components/Header";
import { TOKENS, type TokenSymbol } from "@/lib/tokens";
import { ExternalLink, Wallet, Clock, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout — Tropico Pay",
  description: "Pago hosted vía Tropico Pay. Settlement en USDC en 1 segundo.",
};

type SearchParams = Promise<{
  session?: string;
  ref?: string;
  amount?: string;
  token?: string;
  merchant?: string;
  partner?: string;
  order?: string;
  redirect?: string;
}>;

function isValidPubkey(s: string | undefined) {
  if (!s) return false;
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sessionId = params.session ?? "";
  const reference = params.ref ?? "";
  const amount = Number(params.amount ?? "0");
  const tokenSymbol = (params.token as TokenSymbol) ?? "USDC";
  const merchant = params.merchant ?? "";
  const partner = params.partner ?? "";
  const orderId = params.order ?? "";
  const redirect = params.redirect ?? "";

  const validParams =
    sessionId && reference && amount > 0 && isValidPubkey(merchant);

  // Reconstruir la URL Solana Pay desde los params (la sesión expiró cookies-side)
  const solanaPayUrl = validParams
    ? buildPayUrl({
        recipient: merchant,
        amount,
        tokenSymbol,
        reference,
        label: `${partner} · ${orderId}`,
      })
    : "";

  const qrSrc = solanaPayUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=4&data=${encodeURIComponent(
        solanaPayUrl
      )}`
    : "";

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-5 py-10">
      <Header badge={{ label: "Pay", tone: "sea" }} />

      <header className="flex flex-col gap-2 pt-4">
        <span className="text-xs uppercase tracking-widest text-tropico-sea">
          Tropico Pay · Hosted checkout
        </span>
        <h1 className="font-display text-3xl font-bold">
          {validParams ? "Confirma tu pago" : "Sesión inválida"}
        </h1>
        {validParams && (
          <p className="text-sm text-tropico-mute">
            Pedido <strong className="text-tropico-text">{orderId}</strong> de{" "}
            <strong className="text-tropico-text">{partner}</strong>
          </p>
        )}
      </header>

      {!validParams && (
        <section className="panel flex flex-col gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-6">
          <p className="text-sm text-tropico-mute">
            Faltan parámetros o la sesión expiró. Esta página debe abrirse desde el
            <code className="mx-1 rounded bg-tropico-ink/60 px-1 text-tropico-sun">
              hostedCheckoutUrl
            </code>
            que devuelve <code className="text-tropico-sun">POST /api/checkout/create</code>.
          </p>
          <Link href="/integraciones" className="btn-ghost w-fit text-sm">
            Ver doc de integración
          </Link>
        </section>
      )}

      {validParams && (
        <>
          {/* Amount block */}
          <section className="panel flex flex-col items-center gap-3 p-8">
            <span className="text-xs uppercase tracking-widest text-tropico-mute">
              Cliente paga
            </span>
            <div className="font-display text-5xl font-black text-tropico-coral">
              {amount.toFixed(amount < 1 ? 4 : 2)} {tokenSymbol}
            </div>
            <span className="text-xs text-tropico-mute">
              Comercio recibe el precio exacto · fee 0.5% incluido
            </span>
          </section>

          {/* QR */}
          <section className="panel flex flex-col items-center gap-4 p-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-tropico-sun">
              Escanea con cualquier wallet de Solana
            </span>
            <img
              src={qrSrc}
              alt="QR Solana Pay"
              width={280}
              height={280}
              className="rounded-lg border border-tropico-border bg-white p-2"
            />
            <a
              href={solanaPayUrl}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Wallet className="size-4" /> Abrir en mi wallet
            </a>
            <a
              href={`https://phantom.app/ul/browse/${encodeURIComponent(solanaPayUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-tropico-mute underline hover:text-tropico-sun"
            >
              ¿No tienes wallet? Abrir con Phantom →
            </a>
          </section>

          {/* Info */}
          <section className="panel flex flex-col gap-3 p-5 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-tropico-sea" />
              <div>
                <strong className="text-tropico-text">Settlement en 1 segundo</strong>
                <p className="text-xs text-tropico-mute">
                  Después de confirmar en tu wallet, el comercio ve el pago al instante.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-tropico-green" />
              <div>
                <strong className="text-tropico-text">Sin chargebacks ni reversiones</strong>
                <p className="text-xs text-tropico-mute">
                  La firma on-chain es irreversible — el comercio sabe que la plata es real.
                </p>
              </div>
            </div>
            <details className="border-t border-tropico-border pt-2">
              <summary className="cursor-pointer text-xs text-tropico-mute">
                Detalles técnicos
              </summary>
              <ul className="mt-2 flex flex-col gap-1 text-[11px] text-tropico-mute">
                <li>Sesión: <code className="text-tropico-sun">{sessionId}</code></li>
                <li>Reference: <code className="text-tropico-sun">{reference.slice(0, 16)}…</code></li>
                <li>Token: <code className="text-tropico-sun">{tokenSymbol}</code></li>
                <li>Merchant: <code className="text-tropico-sun">{merchant.slice(0, 8)}…{merchant.slice(-4)}</code></li>
              </ul>
            </details>
          </section>

          {redirect && (
            <a
              href={`${redirect}${redirect.includes("?") ? "&" : "?"}session=${encodeURIComponent(sessionId)}&status=cancelled`}
              className="text-center text-xs text-tropico-mute underline hover:text-tropico-sun"
            >
              Cancelar y volver a {partner}
            </a>
          )}
        </>
      )}

      <footer className="mt-auto flex items-center justify-between gap-2 border-t border-tropico-border pt-4 text-xs text-tropico-mute">
        <span>Powered by Tropico Pay · Solana mainnet</span>
        <a
          href="https://docs.solanapay.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:text-tropico-green"
        >
          Solana Pay spec <ExternalLink className="size-3" />
        </a>
      </footer>
    </main>
  );
}

function buildPayUrl(input: {
  recipient: string;
  amount: number;
  tokenSymbol: TokenSymbol;
  reference: string;
  label: string;
}) {
  const url = new URL(`solana:${input.recipient}`);
  url.searchParams.set("amount", String(input.amount));
  if (input.tokenSymbol !== "SOL") {
    url.searchParams.set("spl-token", TOKENS[input.tokenSymbol].mint);
  }
  url.searchParams.set("reference", input.reference);
  url.searchParams.set("label", input.label);
  return url.toString();
}
