#!/usr/bin/env node
/**
 * Smoke tests E2E para Tropico — Playwright headless contra `next dev`.
 * Navega cada ruta crítica, captura console errors + screenshots.
 *
 * Uso: node scripts/smoke-tests.mjs
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SHOTS_DIR = "/tmp/tropico-shots";
mkdirSync(SHOTS_DIR, { recursive: true });

const ROUTES = [
  { path: "/", label: "landing" },
  { path: "/home", label: "home" },
  { path: "/cambiar", label: "cambiar" },
  { path: "/cobrar", label: "cobrar" },
  { path: "/enviar", label: "enviar" },
  { path: "/guardar", label: "guardar" },
  { path: "/depositar", label: "depositar" },
  { path: "/guacama", label: "guacama" },
  { path: "/guacama/agente", label: "guacama-agente" },
  { path: "/comercios", label: "comercios" },
  { path: "/remesas", label: "remesas" },
  { path: "/pagar-servicios", label: "pagar-servicios" },
  { path: "/integraciones", label: "integraciones" },
  { path: "/wallet/crear", label: "wallet-crear" },
];

const REPORT = [];

async function testRoute(page, route) {
  const errors = [];
  const consoleErrors = [];

  const errHandler = (e) => errors.push(`pageerror: ${e.message}`);
  const consoleHandler = (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Filtrar warnings esperados (favicon, etc.)
      if (!text.includes("favicon") && !text.includes("hydrat")) {
        consoleErrors.push(text);
      }
    }
  };
  page.on("pageerror", errHandler);
  page.on("console", consoleHandler);

  let status = 0;
  let timing = 0;
  try {
    const t0 = Date.now();
    let resp;
    let attempts = 0;
    while (attempts < 2) {
      try {
        resp = await page.goto(`${BASE}${route.path}`, {
          waitUntil: "domcontentloaded",
          timeout: 90_000,
        });
        break;
      } catch (e) {
        attempts++;
        if (attempts >= 2) throw e;
        await page.waitForTimeout(1500);
      }
    }
    timing = Date.now() - t0;
    status = resp?.status() ?? 0;
    await page.waitForTimeout(800); // dejar correr efectos
    await page.screenshot({
      path: `${SHOTS_DIR}/${route.label}.png`,
      fullPage: false,
    });
  } catch (e) {
    errors.push(`navigation: ${e.message}`);
  }

  page.off("pageerror", errHandler);
  page.off("console", consoleHandler);

  REPORT.push({
    route: route.path,
    status,
    timing_ms: timing,
    errors,
    consoleErrors: consoleErrors.slice(0, 5),
  });
}

async function testInteractions(page) {
  const interactions = [];

  // 1. Home: verifica balance card render
  try {
    await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" });
    const hasBalance = await page
      .locator("text=/USDC|SOL|Saldo|balance/i")
      .first()
      .isVisible({ timeout: 5000 });
    interactions.push({ test: "home-balance-visible", ok: hasBalance });
  } catch (e) {
    interactions.push({ test: "home-balance-visible", ok: false, error: e.message });
  }

  // 2. /cambiar — verifica tabs
  try {
    await page.goto(`${BASE}/cambiar`, { waitUntil: "domcontentloaded" });
    const hasBsTab = await page
      .locator("text=/Bol[ií]vares|USDC/i")
      .first()
      .isVisible({ timeout: 5000 });
    interactions.push({ test: "cambiar-tabs", ok: hasBsTab });
  } catch (e) {
    interactions.push({ test: "cambiar-tabs", ok: false, error: e.message });
  }

  // 3. /enviar — verifica form SendToAddress
  try {
    await page.goto(`${BASE}/enviar`, { waitUntil: "domcontentloaded" });
    // Click tab "A wallet" si existe
    const walletTab = page.locator("text=/A wallet|address/i").first();
    if (await walletTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await walletTab.click();
    }
    const hasInput = await page
      .locator('input[placeholder*="7xK"], input[placeholder*="pubkey"]')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    interactions.push({ test: "enviar-pubkey-input", ok: hasInput });
  } catch (e) {
    interactions.push({ test: "enviar-pubkey-input", ok: false, error: e.message });
  }

  // 4. /guacama — verifica chat input
  try {
    await page.goto(`${BASE}/guacama`, { waitUntil: "domcontentloaded" });
    const hasChat = await page
      .locator("textarea, input[type='text']")
      .first()
      .isVisible({ timeout: 5000 });
    interactions.push({ test: "guacama-chat-input", ok: hasChat });
  } catch (e) {
    interactions.push({ test: "guacama-chat-input", ok: false, error: e.message });
  }

  // 5. Header consistency — sticky pill en /cobrar
  try {
    await page.goto(`${BASE}/cobrar`, { waitUntil: "domcontentloaded" });
    const headerVisible = await page
      .locator("header")
      .first()
      .isVisible({ timeout: 3000 });
    interactions.push({ test: "cobrar-header-pill", ok: headerVisible });
  } catch (e) {
    interactions.push({ test: "cobrar-header-pill", ok: false, error: e.message });
  }

  return interactions;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone-ish for VE mobile
    userAgent: "Mozilla/5.0 (iPhone; Tropico Smoke Test)",
  });
  const page = await ctx.newPage();

  console.log(`\n→ Testing ${ROUTES.length} routes against ${BASE}\n`);

  for (const route of ROUTES) {
    process.stdout.write(`  ${route.path.padEnd(25)}`);
    await testRoute(page, route);
    const last = REPORT[REPORT.length - 1];
    const flag =
      last.status === 200 && last.errors.length === 0 ? "✓" : "✗";
    console.log(`${flag}  ${last.status}  ${last.timing_ms}ms`);
  }

  console.log("\n→ Interaction tests\n");
  const interactions = await testInteractions(page);
  for (const i of interactions) {
    console.log(`  ${i.ok ? "✓" : "✗"}  ${i.test}${i.error ? ` — ${i.error}` : ""}`);
  }

  await browser.close();

  // JSON report
  const fullReport = { routes: REPORT, interactions, timestamp: new Date().toISOString() };
  writeFileSync(
    "/tmp/tropico-shots/smoke-report.json",
    JSON.stringify(fullReport, null, 2)
  );

  // Summary
  const failed = REPORT.filter((r) => r.status !== 200 || r.errors.length > 0);
  const interactionsFailed = interactions.filter((i) => !i.ok);
  console.log(`\n${"═".repeat(60)}`);
  console.log(
    `Routes: ${REPORT.length - failed.length}/${REPORT.length} OK  ·  Interactions: ${interactions.length - interactionsFailed.length}/${interactions.length} OK`
  );
  console.log(`Screenshots: ${SHOTS_DIR}`);
  console.log(`Report: /tmp/tropico-shots/smoke-report.json`);

  if (failed.length || interactionsFailed.length) {
    console.log("\n⚠ FAILURES:");
    for (const f of failed) {
      console.log(`  ${f.route}  status=${f.status}`);
      f.errors.forEach((e) => console.log(`    pageerror: ${e}`));
      f.consoleErrors.forEach((e) => console.log(`    console: ${e.slice(0, 120)}`));
    }
    for (const i of interactionsFailed) {
      console.log(`  interaction "${i.test}" failed${i.error ? `: ${i.error.slice(0, 120)}` : ""}`);
    }
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(2);
});
