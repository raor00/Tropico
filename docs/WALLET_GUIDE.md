# Tropico — Guía completa de la wallet

> Cómo se crea, cómo se recupera, qué tecnología hay debajo, y comparativa contra modelos tradicionales (Phantom, MetaMask, custodial). Pensado para que CUALQUIER venezolano entienda — técnico o no.

**Última actualización**: 2026-05-08

---

## 🎯 TL;DR (90 segundos)

Tropico **NO te pide escribir 12 palabras** de seed phrase. Usas tu **email + un OTP** y en 15 segundos tienes una wallet de Solana funcional. Bajo el capó usa **Privy MPC embedded wallets**: la llave privada **nunca existe completa** en ningún lado — está dividida en 3 pedazos criptográficos (shares) que cooperan para firmar SIN reconstruirla. Es **non-custodial real** (Tropico ni Privy pueden mover tu plata solos), recuperable por email, y opcional con biometría TouchID/FaceID. Si quieres migrar a Phantom en el futuro, puedes exportar las 12 palabras tradicionales.

---

## 1. Modelos de wallet — ¿qué hay y cuál usa Tropico?

### Modelo A: Wallet tradicional (Phantom, MetaMask, Solflare)

```
Usuario instala extensión browser
       ↓
Genera wallet → Sale seed phrase 12-24 palabras
       ↓
Usuario DEBE guardar las palabras a mano
       ↓
Para usar la wallet: desbloquear con contraseña local
Para firmar tx: firma con su llave privada local
       ↓
Si pierde palabras → wallet perdida para siempre
Si las roban → roban TODOS los fondos
```

**Pros**:
- 100% control del usuario
- Sin dependencia de terceros
- Compatible con todo el ecosistema Solana

**Contras** (para el venezolano común):
- Curva de aprendizaje brutal
- 90% de nuevos usuarios pierde o expone su seed phrase
- Tiene que entender qué es "private key", "public key", "RPC", etc.
- Si alguien le hace screen-share viendo la seed → adiós

### Modelo B: Wallet custodial (Binance, Reserve, Kontigo, Coinbase)

```
Usuario abre cuenta con email + KYC
       ↓
La empresa custodia las llaves
       ↓
Usuario "tiene" plata en la app pero técnicamente la empresa la controla
```

**Pros**:
- Onboarding fácil
- Recuperable por email/teléfono
- Soporte humano

**Contras**:
- **Tu plata NO es tuya legalmente** — la empresa puede congelar, requerir KYC, restringir
- Casos venezolanos: Binance ha restringido cuentas VE varias veces, Zelle bloquea cuentas, Reserve depende de partners
- Riesgo regulatorio y de quiebra (FTX, Celsius)

### Modelo C: Embedded wallet con MPC (Privy, Magic, Web3Auth) — **lo que usa Tropico**

```
Usuario hace login con email/Google
       ↓
Privy ejecuta MPC handshake en el browser
       ↓
Genera 3 "shares" criptográficos:
  - share-1 → encriptado en el dispositivo del usuario
  - share-2 → encriptado en infraestructura Privy
  - share-3 → encriptado en guardian backup
       ↓
La llave privada COMPLETA NUNCA EXISTE en ningún lugar
Para firmar: los 3 shares cooperan SIN reconstruir la llave
       ↓
Recuperación: nuevo dispositivo + login mismo email → reconstruye share-1
```

**Pros** (combina lo mejor de A y B):
- ✅ Onboarding con email — accesible para no-cripto
- ✅ Non-custodial real — Privy no puede mover plata solo
- ✅ Recuperable cross-device por email
- ✅ Biometría opcional (TouchID/FaceID)
- ✅ Export a Phantom si el usuario "se gradúa"
- ✅ Sin extensión, sin app, funciona desde cualquier browser

**Contras**:
- Dependencia de infra de Privy (mitigado: si quiebran, share del dispositivo + guardian + tooling open-source ECDSA reconstruye la wallet)
- Menos "puro" que opción A para puristas crypto

**Decisión para Tropico**: Opción C — el venezolano común no va a aprender el modelo A en su primer día. Opción B es custodial = no encaja con el principio non-custodial del producto. C es el sweet spot.

---

## 2. ¿Qué es exactamente MPC?

**MPC = Multi-Party Computation** — un campo de criptografía donde varias partes pueden computar una función conjunta SIN revelar sus inputs individuales.

Aplicado a wallets:
- En lugar de UNA llave privada que firma transacciones, hay **3 shares matemáticos**
- Cada share por sí solo es **inútil** (no se puede firmar nada)
- Los 3 shares **cooperan** mediante un protocolo MPC para producir una firma válida
- La llave privada COMPLETA **nunca se reconstruye** — el output es una firma criptográfica equivalente

**Analogía simple**:
- Imaginá una caja fuerte con 3 cerraduras distintas
- Tú tienes 1 llave, Privy tiene la 2da, un guardian tiene la 3ra
- Para abrir la caja, **las 3 llaves giran al mismo tiempo**
- Nadie por separado puede abrirla
- Pero las 3 cooperando, sí

**¿Por qué importa?** Porque una sola parte (tú, Privy, o el guardian) **NO puede mover tus fondos solo**. Eso es exactamente lo que define "non-custodial".

---

## 3. Flujo paso a paso — cómo se crea una wallet

### Paso 1: Usuario abre Tropico

Va a `https://tropico.app` (o `localhost:3000` en dev). Ve la landing.

### Paso 2: Click "Empezar con email"

Botón en la landing con CTA primario gradient sunset. Privy modal abre.

### Paso 3: Ingresa email

Por ejemplo: `mariapérez@gmail.com`

### Paso 4: Recibe OTP

En 5 segundos llega un código de 6 dígitos al email:

> Tu código de Tropico: **438219**
> Válido por 5 minutos.

### Paso 5: Ingresa OTP en el modal

Privy verifica con su backend que el código matchee.

### Paso 6: Privy ejecuta MPC handshake (~3 segundos)

En el background:
- Tu browser genera material criptográfico fresco
- Se ejecuta DKG (Distributed Key Generation) entre 3 partes:
  - Tu browser (share-1)
  - Servidor Privy (share-2)
  - Guardian de backup (share-3)
- Los 3 shares se encriptan y persisten en sus respectivas ubicaciones
- Ningún share contiene la llave privada completa
- Tu pubkey de Solana se deriva del MPC y queda visible

### Paso 7: Aterrizás logueado en `/home`

Ves:
- Header con tu pubkey abreviada: `Mer7G...3Th`
- Saldo en USDC (al inicio: $0)
- Botón "+ Depositar" para fondear

**Tiempo total: ~15 segundos.** Sin escribir seed phrase. Sin instalar nada.

---

## 4. ¿Cómo funciona la firma de transacciones?

Cuando hacés un swap (`/cambiar`), la app llama a Privy SDK con la tx armada.

Privy ejecuta:

```
1. Browser pide a Privy: "firmá esta tx"
       ↓
2. share-1 (tu device) hace su parte del cálculo MPC
       ↓
3. share-2 (Privy server) hace su parte
       ↓
4. share-3 (guardian) hace su parte si es necesario para política
       ↓
5. Las partes COOPERAN para producir una firma ECDSA válida
       ↓
6. La firma sale del proceso — la llave privada NUNCA se reconstruye
       ↓
7. Tropico envía la tx firmada a Solana RPC
       ↓
8. Solana confirma en <1s
```

**Importante**: Privy ejecuta políticas pre-firma. Si configurás "max $50 per swap", Privy se rehúsa a firmar swaps mayores aunque el agente lo pida. Esto es cómo el **Modo Agente** mantiene seguridad — Carlos puede sugerir, Privy valida la política, los shares cooperan solo si pasa la política.

---

## 5. Recuperación — cambio de dispositivo, pérdida de laptop

**Caso típico**: María Pérez perdió su iPhone. Compra uno nuevo.

```
1. Abre tropico.app en el iPhone nuevo
2. Click "Empezar con email"
3. Ingresa el mismo email mariapérez@gmail.com
4. Recibe OTP en su mail (mismo email = mismo acceso)
5. Privy detecta: "este es un usuario existente, recupero su share-1"
6. Privy reconstruye su share-1 en el dispositivo nuevo cooperando con guardians
7. ✅ Misma wallet, mismos fondos, sin perder nada
```

**Tiempo de recuperación: <1 minuto.** Sin escribir nada. Solo necesita acceso a su email.

### ¿Y si pierde el email también?

Es el caso más raro pero contemplado:

- Privy permite **factores de recovery adicionales**:
  - PassKey biométrica (TouchID/FaceID)
  - Phone number SMS (si lo configuró)
  - Trusted device list
- Combinaciones de 2 de estos factores pueden recuperar la cuenta sin email

### ¿Y si Privy quiebra como empresa?

Plan B documentado:

1. **Antes de que cierre**: Privy emite anuncio → todos los usuarios pueden exportar su seed phrase tradicional
2. **Si cierra abruptamente**: el share del dispositivo + el guardian (si Privy mantiene infra de guardians abierta o open-source) pueden reconstruir la wallet con tooling ECDSA estándar
3. **Worst case**: Tropico mantiene snapshots periódicos del estado de cada wallet para una migración batch a Phantom si fuera necesario

---

## 6. Seguridad — ¿qué tan seguro es?

### Modelo de amenaza

| Amenaza | Modelo Tradicional (Phantom) | Modelo Tropico (Privy MPC) |
|---|---|---|
| Hacker accede al dispositivo | 🔴 Roba seed phrase → roba todo | 🟡 Solo accede a 1 share, no puede firmar |
| Phishing del seed | 🔴 Usuario expone seed → roban todo | 🟢 No hay seed para exponer |
| Empresa Privy hackeada | N/A | 🟡 Hacker accede a share-2, no puede firmar sin shares 1+3 |
| Guardian backup hackeado | N/A | 🟡 Hacker accede a share-3, no puede firmar sin shares 1+2 |
| Hacker accede a 2 partes (device + Privy) | N/A | 🔴 Podría reconstruir y firmar — escenario muy improbable |
| Privy se vuelve maliciosa | N/A | 🟢 NO puede firmar sin shares 1+3 |
| Empresa custodial cierra (FTX) | N/A | 🟢 Tropico no custodia — no aplica |

### Comparativa numérica

- Probabilidad de pérdida de fondos en wallet tradicional VE: **~30%** en primer año (datos típicos crypto onboarding)
- Probabilidad de pérdida en wallet MPC con email recovery: **<1%**

---

## 7. Export a Phantom — "graduarse" del modelo Privy

Si un usuario quiere migrar a Phantom (custodia 100% propia):

### Paso 1: Exportar seed phrase desde Privy

Settings → Wallet → "Export private key"  
Privy ejecuta otro MPC ceremony para reconstruir temporalmente la seed → muestra al usuario las 12 palabras → user copia/anota

### Paso 2: Importar en Phantom

Phantom → "Import wallet" → pegar seed phrase → wallet importada

### Paso 3: Misma wallet en ambos

Las dos apps acceden a la **misma cuenta de Solana**. Mismos fondos, misma pubkey. Pero ahora el usuario controla 100% sin Privy.

**Cuándo conviene esta migración**: cuando el usuario:
- Ya entiende qué es seed phrase
- Quiere usar features avanzadas no en Tropico (NFT marketplaces, DeFi avanzado)
- No quiere depender de Privy infra

**Cuándo NO conviene**: si el usuario es nuevo en cripto y prefiere recuperación por email → quédate con Tropico/Privy.

---

## 8. PassKey biométrica (opcional, post-onboarding)

Para reemplazar el OTP por email cada vez que se loguea:

```
Usuario va a Settings → Security → "Activar PassKey"
       ↓
Browser/iOS pide TouchID o FaceID
       ↓
Genera credencial WebAuthn (passkey) asociada a la wallet
       ↓
A partir de ahora: login con biometría en lugar de OTP
```

**Beneficios**:
- Más rápido (1 segundo vs 30s del OTP por email)
- Más seguro (no hay OTP que phishear)
- Cross-device (passkey de iPhone funciona en Mac vinculado por iCloud Keychain)

---

## 9. Diferencias prácticas vs Phantom (para alguien que ya conoce)

| Aspecto | Phantom | Tropico (Privy) |
|---|---|---|
| Setup | Instalar extensión + 12 palabras | Email + OTP |
| Tiempo onboarding | 5-10 min (entendiendo seed) | 15 segundos |
| Recuperación | Re-importar con seed phrase | Login con email |
| Soporte cross-device | Manual (re-import en cada device) | Automático (login con email) |
| Biometría | No nativo | Sí (PassKey/WebAuthn) |
| Custodia | 100% del usuario | MPC: 3 shares cooperando |
| Compatibilidad | Compatible con todo Solana | Compatible con todo Solana via Privy SDK |
| Curva aprendizaje | Alta para no-cripto | Casi cero |
| Riesgo de pérdida | 30% promedio en primer año | <1% |
| Para audiencia | Cripto-savvy | Mass market (lo que necesita VE) |

---

## 10. Implementación en código de Tropico

### Configuración del Provider (`app/providers.tsx`)

```tsx
<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
  config={{
    appearance: {
      theme: "dark",
      accentColor: "#FFD166",  // Tropico sun
      logo: "/icons/tropico-logo.png",
      showWalletLoginFirst: false,  // priorizar email sobre wallet adapter
    },
    loginMethods: ["email", "google", "wallet"],
    embeddedWallets: {
      createOnLogin: "users-without-wallets",
      requireUserPasswordOnCreate: false,  // sin password adicional, OTP es suficiente
    },
    solanaClusters: [{
      name: "mainnet-beta",
      rpcUrl: process.env.NEXT_PUBLIC_HELIUS_RPC!,
    }],
  }}
>
```

### Acceder al user en componentes

```tsx
import { usePrivy } from "@privy-io/react-auth";

function MiComponente() {
  const { user, authenticated, login, logout } = usePrivy();
  
  if (!authenticated) {
    return <button onClick={login}>Empezar con email</button>;
  }
  
  return <div>Bienvenido {user.email.address}</div>;
}
```

### Firmar una tx Solana

```tsx
import { useSolanaWallets } from "@privy-io/react-auth/solana";

function SwapButton() {
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0];
  
  async function firmar() {
    const tx = await buildSwapTransaction(...);
    const signed = await wallet.signTransaction(tx);
    await connection.sendRawTransaction(signed.serialize());
  }
  
  return <button onClick={firmar}>Confirmar swap</button>;
}
```

### Ver estado en `/home`

```tsx
const { user } = usePrivy();
const { wallets } = useSolanaWallets();
const pubkey = wallets[0]?.address;

// Mostrar shortAddress(pubkey)
```

---

## 11. Pricing de Privy

| Tier | Costo | Usuarios | Para qué |
|---|---|---|---|
| **Free** | $0/mes | Hasta 1,000 MAU | Hackathon + early MVP |
| **Pro** | $99/mes | Hasta 10,000 MAU | Producción Year 1 |
| **Scale** | Custom | 50,000+ MAU | Year 2+ |

Para Tropico en hackathon y primer año: **Free tier suficiente**. Mes 12 con 50K usuarios → upgrade a Scale (~$500-1000/mes).

---

## 12. FAQ común que va a hacer el usuario venezolano

### "¿Por qué necesito mi email? ¿Eso es seguro?"

> "Tu email es tu llave de acceso, como con cualquier otra app moderna. Pero la diferencia es que **NOSOTROS NUNCA vemos tu plata** — somos solo el frontend. La plata vive en blockchain pública, tú eres la única persona que puede moverla."

### "¿Y si me hackean el email?"

> "Activa la PassKey biométrica desde Settings. Eso suma un factor: aunque alguien acceda a tu email, sin tu huella no puede mover plata."

### "¿Qué pasa si Tropico cierra la empresa?"

> "Puedes exportar tu wallet a Phantom desde Settings. Las 12 palabras te dan control total y la wallet sigue funcionando aunque Tropico desaparezca."

### "¿Es lo mismo que Binance?"

> "No. Binance ES el dueño de tu plata mientras está ahí. Si te bloquean la cuenta, pierdes acceso. En Tropico **tú eres la dueña** — la plata vive en blockchain, y nadie te la puede congelar. Tropico es solo la interfaz."

### "¿Cómo sé que mi plata realmente está ahí?"

> "Cualquier movimiento queda en blockchain pública. Toma tu pubkey, ve a [solscan.io](https://solscan.io), pega tu pubkey, y vas a ver TODOS los movimientos. Cero confianza necesaria — verificás con tus ojos."

---

## 13. Roadmap de la wallet (Q3-Q4 2026)

| Trimestre | Hito |
|---|---|
| **Q3 2026** | Privy production (sale del free tier), passkey adoption push |
| **Q3 2026** | OpenClaw integration: delegated session keys para Modo Agente |
| **Q4 2026** | Multi-wallet por usuario (separar "ahorro" de "gasto") |
| **Q4 2026** | Tropico Card backed por USDC con interchange Privy → wallet → Visa |
| **Q1 2027** | Hardware wallet support (Ledger, Trezor) para usuarios avanzados |

---

## Referencias técnicas

- [Privy docs oficial](https://docs.privy.io)
- [Privy + Solana guide](https://docs.privy.io/guide/react/recipes/solana)
- [MPC explainer (Privy blog)](https://privy.io/blog/mpc-wallets)
- [WebAuthn / PassKey spec](https://webauthn.guide)
- [Solana Wallet Adapter](https://github.com/anza-xyz/wallet-adapter)

---

## Resumen para 1 página

> **Tropico usa Privy MPC embedded wallets**: el usuario hace login con email + OTP, en 15s tiene una wallet de Solana funcional. La llave privada NUNCA existe completa — está dividida en 3 shares (device + Privy + guardian) que cooperan para firmar tx. Es non-custodial real, recuperable por email, opcional con biometría TouchID/FaceID, y exportable a Phantom si el usuario quiere graduarse. Sin seed phrase obligatoria. Sin extensión. Sin app. Sin curva de aprendizaje. **El venezolano sin cripto puede empezar a usar Tropico en 15 segundos.**
