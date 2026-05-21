/**
 * Captura screenshots de las 11 rutas en desktop + mobile.
 * Saltea la splash screen seteando sessionStorage flag.
 *
 * Uso:
 *   node scripts/screenshots.mjs
 *
 * Requiere: dev server corriendo en localhost:3000
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const ROUTES = [
  ["/", "01-landing"],
  ["/home", "02-home"],
  ["/cambiar", "03-cambiar"],
  ["/cobrar", "04-cobrar"],
  ["/enviar", "05-enviar"],
  ["/guardar", "06-guardar"],
  ["/depositar", "07-depositar"],
  ["/comercios", "08-comercios"],
  ["/guacama", "09-guacama"],
  ["/guacama/agente", "10-guacama-agente"],
  ["/descubrir", "11-descubrir"],
  ["/wallet/crear", "12-wallet-crear"],
  ["/wallet/abrir", "13-wallet-abrir"],
  ["/pagar-servicios", "14-pagar-servicios"],
  ["/remesas", "15-remesas"],
  ["/integraciones", "16-integraciones"],
  ["/checkout", "17-checkout"],
];

const OUT_DIR = "docs/images/screens";
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

console.log("📸 Generando screenshots desktop (1440x900)...");
const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});

for (const [url, name] of ROUTES) {
  const page = await desktop.newPage();
  // Saltear splash screen
  await page.addInitScript(() => {
    sessionStorage.setItem("tropico:splash-shown:v1", "1");
  });
  try {
    await page.goto(`http://localhost:3000${url}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    // Esperar que el rendering termine (animations)
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: `${OUT_DIR}/${name}-desktop.png`,
      fullPage: true,
    });
    console.log(`  ✅ ${name}-desktop.png`);
  } catch (e) {
    console.log(`  ❌ ${name}-desktop.png — ${e.message}`);
  } finally {
    await page.close();
  }
}

console.log("\n📱 Generando screenshots mobile (390x844)...");
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

for (const [url, name] of ROUTES) {
  const page = await mobile.newPage();
  await page.addInitScript(() => {
    sessionStorage.setItem("tropico:splash-shown:v1", "1");
  });
  try {
    await page.goto(`http://localhost:3000${url}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: `${OUT_DIR}/${name}-mobile.png`,
      fullPage: true,
    });
    console.log(`  ✅ ${name}-mobile.png`);
  } catch (e) {
    console.log(`  ❌ ${name}-mobile.png — ${e.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();
console.log("\n🎉 Done! Screenshots en docs/images/screens/");
