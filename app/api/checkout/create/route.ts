import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/checkout";
import { recordAndCheck, AmlConfigError } from "@/lib/aml-server";

// NOTE: record_fee is NOT fired from this route.
// Reason: this route creates a Solana Pay session link but does NOT confirm payment.
// The fee is only materialised when the user's transaction lands on-chain.
// Call sites for record_fee are post-confirmation handlers, e.g.:
//   - realestate buy/transfer confirmation (app/api handlers after on-chain confirm)
//   - Jupiter swap settle handlers
// Those handlers should POST to /api/treasury/record-fee with the X-Tropico-Api-Key
// header after verifying the on-chain signature. A recording failure must be caught
// and logged — it must NOT surface as a user-facing payment error.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/create
 *
 * Endpoint server-to-server para que partners (Yummy Rides, PedidosYa, etc.)
 * creen una sesión de cobro en Tropico Pay.
 *
 * Auth: Bearer token (`TROPICO_PAY_API_KEY`) — en MVP demo está disabled,
 *       en producción se valida y se asocia al partnerId.
 *
 * Body:
 *  {
 *    "merchantWallet": "Mer...",
 *    "amount": 12.50,
 *    "tokenSymbol": "USDC",
 *    "partnerId": "yummy-rides",
 *    "orderId": "ORD-99812",
 *    "channel": "delivery",
 *    "redirectUrl": "https://yummyrides.com/order/99812/success",
 *    "webhookUrl": "https://api.yummyrides.com/webhooks/tropico"
 *  }
 *
 * Response 201:
 *  {
 *    "sessionId": "tps_...",
 *    "reference": "...",
 *    "solanaPayUrl": "solana:...",   ← amount = customerPays (fee incluido)
 *    "hostedCheckoutUrl": "https://tropico.app/checkout?...",
 *    "expiresAt": "2026-05-08T20:30:00.000Z",
 *    "feeBps": 50,
 *    "customerPays": 12.5625,        ← amount + fee (0.5%) — lo que el cliente paga
 *    "merchantReceives": 12.50        ← amount exacto del merchant — sin descuento
 *  }
 *
 *  Modelo de fee (hacia arriba): el fee se añade sobre el monto del merchant.
 *  El merchant recibe exactamente lo que pidió; el cliente absorbe el fee.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Body debe ser JSON válido" },
      { status: 400 }
    );
  }

  const input = body as Record<string, unknown>;

  const required = ["merchantWallet", "amount", "partnerId", "orderId"] as const;
  for (const key of required) {
    if (!input[key]) {
      return NextResponse.json(
        {
          error: "missing_field",
          message: `Falta el campo ${key}`,
          field: key,
        },
        { status: 400 }
      );
    }
  }

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "invalid_amount", message: "amount debe ser número positivo" },
      { status: 400 }
    );
  }

  // Auth check — fail-closed: if TROPICO_PAY_API_KEY is not configured the
  // service refuses all requests rather than silently accepting them.
  const apiKey = process.env.TROPICO_PAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "service_unavailable",
        message: "Payment API key is not configured on this server.",
      },
      { status: 503 }
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${apiKey}`) {
    return NextResponse.json(
      { error: "unauthorized", message: "API key inválida o ausente" },
      { status: 401 }
    );
  }

  // AML: server-side daily/monthly accumulator check (authoritative).
  // checkPerTx is also called inside recordAndCheck.
  try {
    const aml = await recordAndCheck(String(input.merchantWallet), amount);
    if (!aml.allowed) {
      return NextResponse.json(
        {
          error: "aml_limit_exceeded",
          message: "Transaction blocked by AML velocity limits.",
          reasons: aml.reasons,
        },
        { status: 422 }
      );
    }
  } catch (err) {
    if (err instanceof AmlConfigError) {
      // Supabase is not configured — refuse rather than silently skip AML.
      console.error("[checkout/create] AML config error:", err.message);
      return NextResponse.json(
        {
          error: "service_unavailable",
          message: "AML service is not configured on this server.",
        },
        { status: 503 }
      );
    }
    // Unexpected DB / network error — fail-closed.
    console.error("[checkout/create] AML check failed:", err);
    return NextResponse.json(
      { error: "internal_error", message: "AML check failed. Please retry." },
      { status: 500 }
    );
  }

  const session = createCheckoutSession({
    merchantWallet: String(input.merchantWallet),
    amount,
    tokenSymbol: (input.tokenSymbol as "USDC") ?? "USDC",
    partnerId: String(input.partnerId),
    orderId: String(input.orderId),
    channel: (input.channel as "delivery") ?? "other",
    redirectUrl: input.redirectUrl ? String(input.redirectUrl) : undefined,
    webhookUrl: input.webhookUrl ? String(input.webhookUrl) : undefined,
    message: input.message ? String(input.message) : undefined,
  });

  return NextResponse.json(session, {
    status: 201,
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*", // CORS abierto para partners
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
