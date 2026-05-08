import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/checkout";

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
 * Response 200:
 *  {
 *    "sessionId": "tps_...",
 *    "reference": "...",
 *    "solanaPayUrl": "solana:...",
 *    "hostedCheckoutUrl": "https://tropico.app/checkout?...",
 *    "expiresAt": "2026-05-08T20:30:00.000Z",
 *    "feeBps": 50,
 *    "merchantReceives": 12.4375
 *  }
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

  // Auth check (en producción: validar Bearer token contra DB de partners)
  const apiKey = process.env.TROPICO_PAY_API_KEY;
  if (apiKey) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: "unauthorized", message: "API key inválida o ausente" },
        { status: 401 }
      );
    }
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
