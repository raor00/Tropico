---
name: tropico-pay
version: 0.1.0
description: "Generar URLs Solana Pay para Cobrar (merchant QR) y Enviar (claim links peer-to-peer)."
---

# Tropico Pay — Solana Pay URL builder + claim links

Carlos puede:
- Generar URL Solana Pay + QR para que un merchant cobre USDC (módulo Cobrar)
- Generar claim link para enviar USDC a alguien que NO tiene wallet aún (módulo Enviar — el receptor abre el link, login con email, recibe la plata)
- Compartir cualquier URL via WhatsApp deep link

## Comandos disponibles

### Generar URL de cobro (merchant)

```
python3 {SCRIPTS_DIR}/solana_pay_url.py --instance {INSTANCE_ID} --recipient <PUBKEY_MERCHANT> --amount <USD> --label "<NEGOCIO>" --pretty
```

Devuelve JSON:
```json
{
  "url": "solana:Mer...?amount=5&spl-token=EPjFW...&reference=8mQwz...&label=Bodega%20La%20Esquina",
  "reference": "8mQwz...xyz",
  "qrSvg": "<svg>...</svg>"
}
```

### Generar claim link para enviar a alguien sin wallet

```
python3 {SCRIPTS_DIR}/claim_link.py --instance {INSTANCE_ID} --sender <PUBKEY> --amount <USD> --destinatario "<NOMBRE>" --pretty
```

Devuelve JSON:
```json
{
  "claimUrl": "https://tropico.app/claim/AbC123?s=xyz789&monto=10&para=Carmen",
  "claimId": "AbC123",
  "secret": "xyz789",
  "whatsappShareUrl": "https://wa.me/?text=..."
}
```

### Compartir URL por WhatsApp (deep link)

```
python3 {SCRIPTS_DIR}/whatsapp_share.py --instance {INSTANCE_ID} --message "<TEXTO>" --url "<URL>" --pretty
```

## Reglas de ruteo

1. Usuario es merchant y dice "Quiero cobrar $5" → `solana_pay_url.py --recipient <su pubkey> --amount 5 --label <su negocio>`
2. Usuario dice "Mandale $10 a mi tía" → `claim_link.py --sender <su pubkey> --amount 10 --destinatario "tía"`
3. Usuario dice "Comparte este recibo por WhatsApp" → `whatsapp_share.py --message "..." --url "..."`

## Reglas de privacidad y seguridad

- **NO loguear pubkeys completas** en respuestas al usuario — abreviá: `7xKXt3...kJh92`
- **NO mencionar references o secrets** al usuario — son internos
- **Las claim links tienen secret en URL** — advertí al usuario: "compartilo solo con quien le quieras mandar la plata"

## UI Surface (después de generar QR o claim link)

Para cobrar:
```
<tropico-ui>{"version":"v1","chat_right_rail":{"cards":[
  {"eyebrow":"QR de cobro","title":"$5 USDC","description":"Pasaselo al cliente para que escanee","cta":{"label":"Abrir en Cobrar","href":"/cobrar?amount=5"},"tone":"action"}
]}}</tropico-ui>
```

Para claim link:
```
<tropico-ui>{"version":"v1","chat_right_rail":{"cards":[
  {"eyebrow":"Link de cobro","title":"$10 para tía","description":"Compartilo por WhatsApp para que reclame","cta":{"label":"Abrir en Enviar","href":"/enviar"},"tone":"action"}
]}}</tropico-ui>
```

## Ejemplos

- "Quiero cobrarle $5 a un cliente"
  → `solana_pay_url.py --amount 5` → "Listo, tienes tu QR. Pásaselo al cliente para que escanee con su wallet. La plata te cae en 1 segundo. ¿Comparto el recibo por WhatsApp después?"

- "Mandale $20 a mi primo Juan"
  → `claim_link.py --sender <pubkey> --amount 20 --destinatario "primo Juan"` → "Te genero el link para Juan. Cuando abra, le creamos su wallet con su email y recibe los $20. Te dejo el link de WhatsApp listo para mandárselo."
