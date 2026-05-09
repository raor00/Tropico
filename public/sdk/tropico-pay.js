/**
 * Tropico Pay — drop-in SDK v0.1.0
 *
 * Uso:
 *   <script src="https://tropico.app/sdk/tropico-pay.js" defer></script>
 *   <button
 *     data-tropico-pay
 *     data-merchant="<pubkey>"
 *     data-amount="12.50"
 *     data-token="USDC"
 *     data-order="ORD-001"
 *     data-partner="tu-app"
 *     data-redirect="https://tu-app.com/orden/ORD-001/ok"
 *   >Pagar con Tropico</button>
 *
 * Al hacer click:
 *  1. POST /api/checkout/create con los data-* attrs
 *  2. Abre modal con QR (mobile: deeplink solana:...)
 *  3. Polling al webhook simulado (en producción: WebSocket de confirmación)
 *  4. Redirige a data-redirect con ?session=<id>&status=success
 */
(function () {
  "use strict";

  var API_BASE =
    window.TROPICO_PAY_API_BASE ||
    (location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://tropico.app");

  // Inject styles once
  function injectStyles() {
    if (document.getElementById("tropico-pay-styles")) return;
    var style = document.createElement("style");
    style.id = "tropico-pay-styles";
    style.textContent = [
      ".tp-modal{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(10,10,20,0.85);backdrop-filter:blur(8px);font-family:system-ui,-apple-system,sans-serif}",
      ".tp-card{background:#0a0a14;border:1px solid #2a2a3a;border-radius:16px;padding:24px;max-width:380px;width:90%;color:#e9e9f1;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5)}",
      ".tp-title{font-size:20px;font-weight:800;margin:0 0 4px;color:#FFD166}",
      ".tp-sub{font-size:12px;color:#8888a0;margin:0 0 16px}",
      ".tp-amount{font-size:32px;font-weight:900;margin:8px 0;color:#06D6A0}",
      ".tp-fee{font-size:11px;color:#8888a0;margin-bottom:14px}",
      ".tp-qr{display:block;margin:14px auto;padding:12px;background:#fff;border-radius:8px;width:220px;height:220px}",
      ".tp-link{display:inline-block;padding:10px 18px;background:#9945FF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin:8px 4px}",
      ".tp-link.secondary{background:transparent;border:1px solid #2a2a3a;color:#e9e9f1}",
      ".tp-close{position:absolute;top:12px;right:14px;cursor:pointer;color:#8888a0;font-size:24px;line-height:1;background:none;border:none}",
      ".tp-close:hover{color:#fff}",
      ".tp-status{font-size:12px;color:#06D6A0;margin-top:10px}",
      ".tp-error{color:#EF476F}",
    ].join("");
    document.head.appendChild(style);
  }

  function isMobile() {
    return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
  }

  function buildQrSrc(text) {
    // QR vía servicio gratuito (en prod: render local con qrcode.js bundled)
    return (
      "https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=" +
      encodeURIComponent(text)
    );
  }

  function buildModal(session, btn) {
    var customerPays = session.customerPays;
    var receives = session.merchantReceives;
    var token = btn.dataset.token || "USDC";
    var modal = document.createElement("div");
    modal.className = "tp-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML =
      '<div class="tp-card">' +
      '  <button class="tp-close" aria-label="Cerrar">×</button>' +
      '  <h3 class="tp-title">Pagar con Tropico</h3>' +
      '  <p class="tp-sub">Sesión ' + escapeHtml(session.sessionId) + '</p>' +
      '  <div class="tp-amount">' + customerPays + ' ' + escapeHtml(token) + '</div>' +
      '  <div class="tp-fee">El comercio recibe ' + receives + ' ' + escapeHtml(token) +
      ' exactos · fee 0.5% incluido</div>' +
      '  <img class="tp-qr" alt="QR Solana Pay" src="' + buildQrSrc(session.solanaPayUrl) + '" />' +
      '  <a class="tp-link" href="' + escapeHtml(session.solanaPayUrl) + '">Abrir wallet</a>' +
      '  <a class="tp-link secondary" href="' + escapeHtml(session.hostedCheckoutUrl) +
      '" target="_blank" rel="noreferrer">Hosted checkout</a>' +
      '  <p class="tp-status" data-tp-status>Esperando confirmación on-chain…</p>' +
      "</div>";
    modal.querySelector(".tp-close").addEventListener("click", function () {
      modal.remove();
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.remove();
    });
    document.body.appendChild(modal);
    return modal;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Polling stub — en producción esto sería un WebSocket o llamada a /api/checkout/status
  function pollStatus(modal, session, onSuccess) {
    var attempts = 0;
    var max = 30; // 30 * 2s = 1 min máx
    var interval = setInterval(function () {
      attempts++;
      // En MVP demo no hay verificación real; en producción:
      //   GET /api/checkout/status?session=<id>&reference=<ref>
      // que internamente hace findReference contra Solana RPC.
      if (attempts >= max) {
        clearInterval(interval);
        var status = modal.querySelector("[data-tp-status]");
        if (status) {
          status.className = "tp-status tp-error";
          status.textContent = "Sesión expiró. Cierra y vuelve a intentar.";
        }
      }
    }, 2000);
    return function cancel() {
      clearInterval(interval);
    };
  }

  async function startCheckout(btn) {
    var data = btn.dataset;
    if (!data.merchant || !data.amount || !data.order || !data.partner) {
      console.error("[tropico-pay] Faltan data-attrs requeridos:", data);
      return;
    }
    btn.disabled = true;
    var origText = btn.textContent;
    btn.textContent = "Conectando…";
    try {
      var res = await fetch(API_BASE + "/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantWallet: data.merchant,
          amount: parseFloat(data.amount),
          tokenSymbol: data.token || "USDC",
          partnerId: data.partner,
          orderId: data.order,
          channel: data.channel || "other",
          redirectUrl: data.redirect || undefined,
          message: data.message || undefined,
        }),
      });
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
      var session = await res.json();
      injectStyles();
      // En mobile, intenta deeplink directo si el wallet está instalado
      if (isMobile()) {
        // Abre modal igual como fallback, pero también dispara deeplink
        window.location.href = session.solanaPayUrl;
      }
      var modal = buildModal(session, btn);
      pollStatus(modal, session, function () {
        if (data.redirect) {
          window.location.href =
            data.redirect +
            (data.redirect.indexOf("?") === -1 ? "?" : "&") +
            "session=" +
            encodeURIComponent(session.sessionId) +
            "&status=success";
        }
      });
    } catch (err) {
      console.error("[tropico-pay] checkout failed:", err);
      alert("No pudimos crear la sesión de pago. Intenta de nuevo.");
    } finally {
      btn.disabled = false;
      btn.textContent = origText;
    }
  }

  function attachAll() {
    var btns = document.querySelectorAll("[data-tropico-pay]");
    btns.forEach(function (btn) {
      if (btn.dataset.tpAttached) return;
      btn.dataset.tpAttached = "1";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        startCheckout(btn);
      });
    });
  }

  // Auto-attach al cargar + observar mutaciones
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachAll);
  } else {
    attachAll();
  }

  // Re-attach si se inyectan botones después
  var observer = new MutationObserver(attachAll);
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  // API pública para integraciones programáticas
  window.TropicoPay = {
    version: "0.1.0",
    open: function (opts) {
      var fakeBtn = document.createElement("button");
      Object.keys(opts).forEach(function (k) {
        fakeBtn.dataset[k] = opts[k];
      });
      startCheckout(fakeBtn);
    },
  };
})();
