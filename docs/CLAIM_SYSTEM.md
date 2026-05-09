# Tropico — Sistema de Claim Links (Enviar)

> Cómo funciona el módulo de envíos de Tropico de punta a punta: desde que el sender ingresa el monto hasta que el receptor reclama los fondos en su wallet.

**Última actualización**: 2026-05-08

---

## TL;DR

El sender genera un link con `claimId` + `secret`. La app guarda el claim en localStorage y abre WhatsApp con el link. El receptor abre la URL, crea un wallet con Privy si no tiene, y firma la transacción que libera los fondos del escrow hacia su wallet.

```
Sender                         WhatsApp                    Receptor
  │                               │                            │
  │ ingresa monto + nombre        │                            │
  │ ──────────────────────>       │                            │
  │                               │                            │
  │ <── link generado ──          │                            │
  │    /claim/{claimId}?s=...     │                            │
  │                               │                            │
  │ comparte link ──────────────> │                            │
  │                               │ abre link ──────────────> │
  │                               │                            │ login Privy
  │                               │                            │ (email/Google)
  │                               │                            │
  │                               │              firma tx y reclama fondos
  │                               │                            │
  │ <── "Juan reclamó tus $5" ──────────────────────────────  │
```

---

## Por qué existen los claim links

El problema central de cualquier app de remesas en Venezuela es el **friction de onboarding del receptor**.

El flujo tradicional te obliga a:
1. Que el receptor ya tenga wallet
2. Que el receptor te dé su dirección (44 caracteres crípticos)
3. Que vos pegues bien esa dirección (un error y los fondos se pierden para siempre)

Esto mata la adopción. Tu tía Carmen no tiene Phantom. Tu primo que acaba de llegar a Bogotá tampoco.

Los claim links invierten el modelo: **el sender no necesita saber nada del receptor, y el receptor puede crear su wallet al momento de recibir**. El onboarding pasa en el contexto del cobro — cuando hay motivación real.

---

## Cómo funciona técnicamente — flujo completo en 9 pasos

### Paso 1 — Sender abre `/enviar`

El sender ingresa el monto en USD y el nombre del destinatario (campo libre — puede ser "Mi tía Carmen", "Pedro WhatsApp", etc.). El nombre es solo para UX: aparece en el mensaje de WhatsApp y en el tracking del sender.

```
/app/enviar/page.tsx → <SendForm />
```

### Paso 2 — App genera `claimId` + `secret`

Al presionar "Crear link de cobro", `SendForm.tsx` llama `generateReference()` dos veces:

```typescript
// lib/solana-pay.ts
export function generateReference(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < 32; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

// en SendForm.tsx
const claimId = generateReference();          // 32 chars base58 — identificador público
const secret  = generateReference().slice(0, 16); // 16 chars — autoriza el reclamo
```

- **`claimId`**: identificador único del claim. No es secreto — puede aparecer en logs, analytics, URLs. Solo sirve para encontrar el claim en la base de datos.
- **`secret`**: autorización del reclamo. Solo el que tiene la URL puede reclamar los fondos. NUNCA debe aparecer en logs.

> En producción, `generateReference()` debe ser reemplazado por `Keypair.generate().publicKey.toBase58()` del SDK de Solana para tener aleatoriedad criptográfica segura.

### Paso 3 — Sender firma tx que transfiere USDC al escrow

El sender firma una transacción SPL Token que mueve USDC desde su wallet hacia un **escrow PDA** derivado del programa:

```
PDA = findProgramAddressSync(
  [Buffer.from("claim"), Buffer.from(claimId)],
  TROPICO_PROGRAM_ID
)
```

Esa PDA es la cuenta de escrow — nadie la controla directamente, solo el programa puede firmar transfers desde ella.

> **Estado actual**: en el MVP esto es simulado (ver sección "Estado actual MVP"). La tx real al PDA se implementa en Q3.

### Paso 4 — App persiste el claim en localStorage del sender

```typescript
// SendForm.tsx
const claims = JSON.parse(localStorage.getItem("tropico:claims:sent") ?? "[]");
claims.push({
  claimId,
  secret,
  monto: amountNumber,
  destinatario,
  creadoEn: new Date().toISOString(),
  status: "pending",
});
localStorage.setItem("tropico:claims:sent", JSON.stringify(claims));
```

El sender ve su historial de envíos en `/home` leyendo esta key. El campo `status` pasa de `"pending"` a `"claimed"` cuando el receptor reclama.

Opcionalmente, en producción, este registro también se persiste en un **Edge KV** (Vercel KV o Upstash) para:
- Detectar que el receptor reclamó, incluso si el sender cambia de dispositivo
- TTL automático de 7 días (ver sección "Edge cases")
- Webhook de notificación al sender

### Paso 5 — App genera URL y abre WhatsApp

```typescript
const url = `${baseUrl}/claim/${claimId}?s=${secret}&monto=${amountNumber}&para=${encodeURIComponent(destinatario)}`;
```

La URL se construye con todos los parámetros y se pasa al helper de WhatsApp:

```typescript
// lib/solana-pay.ts
export function whatsappShareUrl(message: string, url?: string): string {
  const text = url ? `${message}\n\n${url}` : message;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
```

El mensaje incluye el monto, el nombre, y el link. El receptor lo recibe en WhatsApp como un mensaje normal.

### Paso 6 — Receptor abre el link

El receptor abre `/claim/{claimId}?s={secret}&monto={n}&para={name}`.

Si el receptor no tiene wallet:
- La app muestra un CTA de "Crear tu wallet gratis"
- Privy abre su modal de login (email o Google)
- **Privy crea una wallet MPC automáticamente** con `createOnLogin: "users-without-wallets"`
- La wallet existe en el dispositivo del receptor desde ese momento

Si el receptor ya tiene wallet (Phantom, Solflare, o Privy de una sesión anterior):
- Login directo, sin crear wallet nueva

### Paso 7 — App valida el claim

```typescript
// La página /claim lee los params de la URL
const claimId = params.claimId
const secret  = searchParams.get("s")

// Llama al backend (Edge function o verificación localStorage)
// y valida:
// 1. El claimId existe en la base de datos
// 2. El secret matches (hash comparison)
// 3. El status es "pending" (no ya reclamado)
```

Si alguna validación falla, la app muestra un error: "Este link ya fue usado", "Link inválido", o "Link expirado".

### Paso 8 — Receptor firma tx que libera el escrow

El receptor firma una transacción que:

1. Verifica que `secret` es correcto (como seed adicional en la derivación del PDA)
2. Llama al instruction `claim` del programa Anchor
3. El programa transfiere USDC del PDA escrow → wallet del receptor
4. El programa cierra la cuenta escrow (recupera el rent lamports para el receptor)

```rust
// Pseudocódigo del instruction Anchor (Q3)
pub fn claim(ctx: Context<Claim>, claim_id: [u8; 32], secret: [u8; 16]) -> Result<()> {
    let escrow = &ctx.accounts.escrow;
    require!(escrow.secret == secret, ClaimError::InvalidSecret);
    require!(escrow.status == ClaimStatus::Pending, ClaimError::AlreadyClaimed);
    
    // Transfer USDC del PDA al receptor
    token::transfer(ctx.accounts.transfer_ctx(), escrow.amount)?;
    
    // Marcar como reclamado
    escrow.status = ClaimStatus::Claimed;
    Ok(())
}
```

Solo el receptor que tiene la URL completa (con el `?s=...`) puede reclamar — sin ese secret, el instruction falla on-chain.

### Paso 9 — Confirmación y notificación al sender

La tx se confirma en la red (~400ms devnet / ~1s mainnet). La app:

1. Actualiza `status: "claimed"` en el Edge KV y en el localStorage del receptor
2. Envía un evento de notificación al sender (Push notification o badge en `/home`)
3. El sender ve en su pantalla: `✅ Juan reclamó tus $5.00`

---

## Anatomía de un claim URL

```
https://tropico.app/claim/7xKXtABCDEF123456789abcdefghij?s=AbCdEf12345678&monto=5&para=Juan
│                    │                                   │               │      │
│                    │                                   │               │      └─ nombre del receptor (display only)
│                    │                                   │               └─ monto en USD (display only)
│                    │                                   └─ secret (16 chars base58) — PRIVADO
│                    └─ claimId (32 chars base58) — identificador público
└─ dominio base
```

| Parámetro | Tipo | Secreto | Propósito |
|---|---|---|---|
| `claimId` (path) | 32-char base58 | No | Identificar el claim en DB + on-chain |
| `s` | 16-char base58 | **Sí** | Autorizar el reclamo — sin esto, tx falla |
| `monto` | número | No | Mostrar al receptor cuánto va a recibir antes de que abra wallet |
| `para` | string URL-encoded | No | Personalizar el mensaje de bienvenida |

---

## Estado actual MVP

### Lo que ES real (funciona en el MVP actual)

- Generación de `claimId` y `secret` con base58 pseudo-random
- Construcción de la URL `/claim/{claimId}?s=...`
- Persistencia en `localStorage` del sender (`tropico:claims:sent`)
- Share vía WhatsApp con `wa.me/?text=...`
- Página `/claim` con parámetros legibles
- Creación de wallet Privy del receptor (si no tiene) — **esto es 100% real con Privy SDK**
- Fee display (0.3%) en la UI del sender

### Lo que ES mock en el MVP

- **El escrow PDA**: en MVP, el sender transfiere USDC a una wallet temporal de Privy gestionada por el sender — no hay un PDA de programa. El "escrow" es la palabra del sender de que los fondos están esperando.
- **La firma del receptor**: la página `/claim` confirma el reclamo simulado localmente (localStorage) sin broadcast de tx real
- **La notificación al sender**: "reclamó tus $5" aparece en la UI pero no se dispara desde un evento on-chain real

### Q3 — implementación del escrow real

Opciones para el escrow real, en orden de menor a mayor esfuerzo:

| Opción | Esfuerzo | Riesgo |
|---|---|---|
| Programa Anchor custom (`claim-escrow`, ~80 LOC) | 2-3 días | Requiere auditoría eventual |
| Usar un escrow program ya auditado (ej. Bonfida Name Service escrow, Squads conditional) | 1 día de integración | Ninguno (ya auditado) |
| Token-2022 con `TransferHook` custom | 1 semana | Más complejidad |

**Recomendación Q3**: el programa Anchor custom de 80 LOC es el camino más claro — la surface de ataque es mínima (una sola instruction: `create_escrow` + `claim` + `refund_expired`).

---

## Edge cases

### El receptor pierde el link

El sender puede ver sus claims pendientes en `/home` y **reenviar el link** — el `claimId` y `secret` están guardados en localStorage del sender. La URL se puede regenerar desde esos datos.

> En producción: el sender también puede copiar el link desde el historial de envíos en la app.

### El sender quiere recuperar fondos no reclamados

TTL de 7 días. Después de ese tiempo:
- El programa Anchor permite llamar `refund_expired` que transfiere los fondos de vuelta al sender
- La app muestra el claim como "expirado" y ofrece un botón "Recuperar fondos"
- El Edge KV borra el registro (o lo marca `status: "expired"`)

En el MVP actual, no hay recuperación automática — el sender debe crear un nuevo envío si el receptor no reclamó.

### Dos personas abren el mismo link al mismo tiempo

**First-come-first-served on-chain**: la primera tx que ejecute el `claim` instruction con el `secret` correcto gana. La segunda tx falla porque el escrow ya está marcado como `claimed` y la cuenta puede estar cerrada.

La página `/claim` puede mostrar "Este link ya fue reclamado" después de la confirmación de la primera tx.

### El receptor tiene conexión lenta / cierra el navegador durante el reclamo

La tx no se firmó todavía — los fondos siguen en el escrow PDA. El receptor puede volver a abrir el link y completar el reclamo. El link sigue válido hasta que se reclame o expire.

---

## Seguridad

### El `secret` NUNCA va en logs o analytics

```typescript
// MAL — nunca hacer esto
console.log(`Claim creado: claimId=${claimId} secret=${secret}`)
analytics.track("claim_created", { claimId, secret }) // secret expuesto

// BIEN
analytics.track("claim_created", { claimId }) // solo el ID público
```

Si el `secret` aparece en logs, cualquiera con acceso a los logs puede reclamar los fondos antes que el receptor.

### El `claimId` NO es secreto

El `claimId` puede aparecer en:
- URLs de tracking
- Dashboards de analytics
- Logs del servidor
- Explorers on-chain (es el seed del PDA)

Está diseñado para ser público — no autoriza nada por sí solo.

### El link solo se comparte por canal seguro

WhatsApp usa E2E encryption por defecto — es el canal recomendado. Si el receptor comparte el link en un grupo público o lo pega en redes sociales, cualquiera puede reclamarlo (el link no está vinculado a la identidad del receptor, sino al `secret`).

La app muestra este aviso explícitamente en el step de `shared`:
```
⚠️ Comparte el link solo con quien quieres que reciba el dinero.
   Quien tenga el link puede reclamar los fondos.
```

### Replay attacks

El escrow PDA tiene estado. Una vez `claimed`, rechaza cualquier intento de reclamo posterior. La transaction signature de la tx de reclamo es única y no puede ser reusada (nonce implícito en el blockhash de Solana).

---

## Comparación con remesas tradicionales

| | Tropico claim link | Western Union / MoneyGram | Transferencia bancaria |
|---|---|---|---|
| **Velocidad** | ~1 segundo on-chain | 1–5 días hábiles | 1–3 días hábiles |
| **Fee** | 0.3% (sender) | 5–10% del monto | $15–$35 fijo + FX |
| **El receptor necesita...** | Solo abrir el link | Ir a sucursal con ID | Cuenta bancaria en VE |
| **Disponible 24/7** | Sí | Depende de horario | Depende del banco |
| **Sin cuenta bancaria** | Sí — wallet creada al abrir el link | No (necesita ID en sucursal) | No |
| **Rastreable** | Sí — on-chain público | Código de seguimiento (privado) | Comprobante PDF |
| **Reversible** | No (blockchain es final) | Sí (en ventana) | Depende del banco |
| **Mínimo** | $0.01 | $10–$50 | Variable |

---

## Archivos relevantes

```
app/
  enviar/page.tsx              — ruta /enviar, metadata, layout
components/
  SendForm.tsx                 — lógica UI completa del flujo sender (3 steps: form → link → shared)
lib/
  solana-pay.ts                — generateReference(), whatsappShareUrl(), buildSolanaPayUrl()
  tokens.ts                    — TOKENS config (mint addresses, decimales)
```

El módulo `/claim` (ruta del receptor) está pendiente de implementación completa — actualmente solo lee params de la URL.
