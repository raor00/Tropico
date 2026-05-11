# Checklist — Submisión Colosseum

> Lista operacional para completar antes de hacer click en "Submit". Marca cada ítem cuando esté listo.

---

## Información de la submisión

- [ ] **Nombre del proyecto**: Tropico Wallet
- [ ] **Tagline**: completar en el form del hackathon
- [ ] **Sección Team** en `docs/COLOSSEUM_SUBMISSION.md` completada con nombres reales, Twitter/X, GitHub
- [ ] **URL del demo live** confirmada y funcionando: `https://tropico-rho.vercel.app`
- [ ] **URL del repositorio** GitHub público con licencia MIT confirmada
- [ ] **Descripción corta** del proyecto escrita para el form (< 280 caracteres)

---

## Video

- [ ] Video de demo grabado (3-5 minutos)
- [ ] El video cubre el flujo BsX (el diferencial principal)
- [ ] El video muestra Pago Móvil VE funcionando
- [ ] El video muestra Carlos AI respondiendo en español venezolano
- [ ] El video está subido a YouTube (unlisted está bien)
- [ ] URL del video pegada en `docs/COLOSSEUM_SUBMISSION.md` sección Links

---

## Demo live

- [ ] Deploy en Vercel respondiendo sin errores 500
- [ ] Login con email funciona (Privy)
- [ ] Modo demo · devnet activa correctamente
- [ ] Tab Bolívares en `/cambiar` ejecuta el flujo BsX
- [ ] `/pagar-servicios` muestra integración Pago Móvil VE
- [ ] `/carlos` responde en < 5 segundos (con API key configurada en Vercel)
- [ ] La app carga en móvil (Android + iOS, Chrome + Safari)
- [ ] Variables de entorno en Vercel configuradas y verificadas:
  - [ ] `NEXT_PUBLIC_PRIVY_APP_ID`
  - [ ] `GOOGLE_GENERATIVE_AI_API_KEY` (o `DEEPSEEK_API_KEY`)
  - [ ] `NEXT_PUBLIC_HELIUS_RPC`
  - [ ] Fee accounts (`NEXT_PUBLIC_TROPICO_FEE_OWNER`, ATAs)

---

## Contratos on-chain

- [x] `programs/tropico_treasury` implementado y compilable
  - [x] Program ID real configurado: `3a5NkTssAsVaarUPqx4YokNwUcfxHnNebGugrgBBxe8S` (`Anchor.toml` + `declare_id!()`)
  - [x] Keypair en `target/deploy/tropico_treasury-keypair.json`
- [x] `programs/tropico_bs` implementado y configurado
  - [x] Program ID real configurado: `EdWuyZDXao86mTcUSpRVzNXaT9Tb5muU6YGubFhADWdN` (`Anchor.toml` + `declare_id!()`)
  - [x] Tests en `tests/tropico_bs.ts` (7 casos cubren initialize/mint/burn/attest/update_peg/pause)
- [ ] **Opcional pre-submit**: deploy a devnet vía `anchor deploy --provider.cluster devnet` (requiere ~2 SOL devnet + resolver conflicto Rust edition2024 en dep transitivo `constant_time_eq 0.4.2`)
- [ ] **Opcional pre-submit**: 1 `mint_bsx` demo + 1 `attest_reserves` verificables en Solscan devnet
- [ ] **Opcional pre-submit**: links a Solscan pegados en el form de submisión

---

## Documentación

- [ ] `README.md` — revisado, badge demo URL actual
- [ ] `docs/COLOSSEUM_SUBMISSION.md` — sección Team completada, URLs reales
- [ ] `docs/ARCHITECTURE.md` — revisado
- [ ] `docs/PROTOCOL_BSX.md` — revisado
- [ ] `.env.example` presente en el repo con todas las variables documentadas (sin valores reales)

---

## Pitch deck

- [ ] Deck actualizado con el nuevo ángulo BsX (no solo "wallet venezolana")
- [ ] Slide de demo con URL correcta
- [ ] Slide de arquitectura con diagrama actualizado
- [ ] Links del deck en `docs/COLOSSEUM_SUBMISSION.md`

---

## Rehearsal del demo

- [ ] Flujo completo ejecutado en vivo al menos 2 veces sin errores
- [ ] Fallback preparado: si Pago Móvil VE falla en demo, tener screenshot/grabación de respaldo
- [ ] Carlos AI respondiendo correctamente con LLM real (no solo fallback)
- [ ] Demo en mobile ejecutado

---

## Antes del click final

- [ ] Repositorio es público (sin archivos sensibles en git history)
- [ ] `.env.local` y `.env` en `.gitignore` y NO commiteados
- [ ] Licencia MIT presente en `LICENSE`
- [ ] Form del hackathon completado con todos los campos requeridos
- [ ] Leer los Terms & Conditions de Colosseum una vez más
