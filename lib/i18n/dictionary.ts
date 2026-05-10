/**
 * Diccionario i18n centralizado. Keys = identificadores estables, values =
 * traducción por idioma. Default es ES (mercado VE).
 *
 * Para agregar idioma: extender el tipo Lang + agregar columna en cada entry.
 * Para agregar key: agregarla en `dict` con las 4 traducciones.
 */

export type Lang = "es" | "en" | "pt" | "fr";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇻🇪" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export const DEFAULT_LANG: Lang = "es";

type Entry = Record<Lang, string>;

export const dict = {
  // Header / nav
  "nav.wallet": { es: "Wallet", en: "Wallet", pt: "Carteira", fr: "Portefeuille" },
  "nav.cambiar": { es: "Cambiar", en: "Swap", pt: "Trocar", fr: "Échanger" },
  "nav.cobrar": { es: "Cobrar", en: "Receive", pt: "Receber", fr: "Recevoir" },
  "nav.enviar": { es: "Enviar", en: "Send", pt: "Enviar", fr: "Envoyer" },
  "nav.guardar": { es: "Guardar", en: "Save", pt: "Guardar", fr: "Épargner" },
  "nav.remesas": { es: "Remesas", en: "Remittances", pt: "Remessas", fr: "Transferts" },
  "nav.carlos": { es: "Carlos", en: "Carlos", pt: "Carlos", fr: "Carlos" },
  "nav.comercios": { es: "Comercios", en: "Merchants", pt: "Comércios", fr: "Commerces" },
  "nav.servicios": { es: "Servicios", en: "Bills", pt: "Contas", fr: "Factures" },
  "header.cta.mywallet": { es: "Mi Tropico", en: "My Tropico", pt: "Meu Tropico", fr: "Mon Tropico" },
  "header.cta.create": { es: "Crear wallet", en: "Create wallet", pt: "Criar carteira", fr: "Créer portefeuille" },

  // Home
  "home.greeting": { es: "Hola", en: "Hi", pt: "Olá", fr: "Salut" },
  "home.tagline": { es: "Tu wallet caribeña en Solana", en: "Your Caribbean wallet on Solana", pt: "Sua carteira caribenha em Solana", fr: "Votre portefeuille caribéen sur Solana" },
  "home.balance.total": { es: "Saldo total", en: "Total balance", pt: "Saldo total", fr: "Solde total" },
  "home.balance.available": { es: "Disponible", en: "Available", pt: "Disponível", fr: "Disponible" },
  "home.balance.onchain": { es: "on-chain", en: "on-chain", pt: "on-chain", fr: "on-chain" },
  "home.actions": { es: "Acciones", en: "Actions", pt: "Ações", fr: "Actions" },
  "home.tokens.title": { es: "Tus tokens", en: "Your tokens", pt: "Seus tokens", fr: "Vos jetons" },
  "home.empty.message": { es: "Tu wallet está vacía. Fondea con USDC para empezar.", en: "Your wallet is empty. Add USDC to start.", pt: "Sua carteira está vazia. Adicione USDC para começar.", fr: "Votre portefeuille est vide. Ajoutez de l'USDC pour commencer." },
  "home.empty.deposit": { es: "Depositar", en: "Deposit", pt: "Depositar", fr: "Déposer" },
  "home.empty.faucet": { es: "Reclamar faucet", en: "Claim faucet", pt: "Resgatar faucet", fr: "Réclamer faucet" },

  // Action card descriptions
  "card.cambiar.desc": { es: "Tokens o Bs↔USDC al mejor precio", en: "Tokens or VES↔USDC at best price", pt: "Tokens ou VES↔USDC ao melhor preço", fr: "Jetons ou VES↔USDC au meilleur prix" },
  "card.cobrar.desc": { es: "QR Solana Pay — recibe USDC al instante", en: "Solana Pay QR — receive USDC instantly", pt: "QR Solana Pay — receba USDC instantaneamente", fr: "QR Solana Pay — recevez USDC instantanément" },
  "card.enviar.desc": { es: "Manda USDC a quien quieras, instantáneo", en: "Send USDC to anyone, instantly", pt: "Envie USDC para qualquer um, instantâneo", fr: "Envoyez USDC à n'importe qui, instantané" },
  "card.guardar.desc": { es: "Tu plata generando ~5% al año automático", en: "Your money earning ~5% annual automatically", pt: "Seu dinheiro rendendo ~5% ao ano automático", fr: "Votre argent gagnant ~5% par an automatique" },

  // Send
  "send.title": { es: "Enviar", en: "Send", pt: "Enviar", fr: "Envoyer" },
  "send.subtitle": { es: "A wallet directo (firma onchain) o claim link (sin wallet, vía WhatsApp)", en: "Direct to wallet (onchain) or claim link (no wallet, via WhatsApp)", pt: "Direto para carteira (onchain) ou claim link (sem carteira, via WhatsApp)", fr: "Direct vers portefeuille (onchain) ou lien de réclamation (sans portefeuille, via WhatsApp)" },
  "send.tab.wallet": { es: "A wallet (address)", en: "To wallet (address)", pt: "Para carteira (endereço)", fr: "Vers portefeuille (adresse)" },
  "send.tab.claim": { es: "Claim link (sin wallet)", en: "Claim link (no wallet)", pt: "Claim link (sem carteira)", fr: "Lien de réclamation (sans portefeuille)" },
  "send.dest.label": { es: "Wallet destino (pubkey)", en: "Destination wallet (pubkey)", pt: "Carteira destino (pubkey)", fr: "Portefeuille destination (pubkey)" },
  "send.amount.label": { es: "Monto en", en: "Amount in", pt: "Valor em", fr: "Montant en" },
  "send.button": { es: "Enviar", en: "Send", pt: "Enviar", fr: "Envoyer" },
  "send.signing": { es: "Firmando + broadcast…", en: "Signing + broadcast…", pt: "Assinando + transmissão…", fr: "Signature + diffusion…" },

  // Pago móvil / Suiche7B
  "pagomovil.title": { es: "Pagar con Pago Móvil", en: "Pay with Mobile Banking (VE)", pt: "Pagar com Pago Móvel (VE)", fr: "Payer avec Pago Móvil (VE)" },
  "pagomovil.subtitle": { es: "Escaneá el QR Suiche7B del comercio. Tropico convierte tu USDC a Bs y paga al instante.", en: "Scan the merchant's Suiche7B QR. Tropico converts your USDC to VES and pays instantly.", pt: "Escaneie o QR Suiche7B do comércio. Tropico converte seu USDC para VES e paga instantaneamente.", fr: "Scannez le QR Suiche7B du commerce. Tropico convertit votre USDC en VES et paie instantanément." },
  "pagomovil.scan.cta": { es: "Escanear QR Suiche7B", en: "Scan Suiche7B QR", pt: "Escanear QR Suiche7B", fr: "Scanner QR Suiche7B" },
  "pagomovil.scan.hint": { es: "Apuntá la cámara al QR del comercio. Detección automática.", en: "Point your camera at the merchant QR. Auto-detect.", pt: "Aponte a câmera para o QR do comércio. Auto-detecção.", fr: "Pointez votre caméra vers le QR du commerce. Détection auto." },
  "pagomovil.confirm.title": { es: "Confirmar pago", en: "Confirm payment", pt: "Confirmar pagamento", fr: "Confirmer le paiement" },
  "pagomovil.field.bank": { es: "Banco", en: "Bank", pt: "Banco", fr: "Banque" },
  "pagomovil.field.phone": { es: "Teléfono", en: "Phone", pt: "Telefone", fr: "Téléphone" },
  "pagomovil.field.cedula": { es: "Cédula", en: "ID", pt: "Documento", fr: "Pièce d'identité" },
  "pagomovil.field.amountBs": { es: "Monto en Bs", en: "Amount in VES", pt: "Valor em VES", fr: "Montant en VES" },
  "pagomovil.field.amountUsd": { es: "Te descontamos en USDC", en: "We charge you in USDC", pt: "Cobramos em USDC", fr: "Débité en USDC" },
  "pagomovil.field.rate": { es: "Tasa Tropico", en: "Tropico rate", pt: "Taxa Tropico", fr: "Taux Tropico" },
  "pagomovil.field.fee": { es: "Comisión", en: "Fee", pt: "Comissão", fr: "Commission" },
  "pagomovil.button.pay": { es: "Pagar ahora", en: "Pay now", pt: "Pagar agora", fr: "Payer maintenant" },
  "pagomovil.processing": { es: "Procesando en el pool Tropico…", en: "Processing on Tropico pool…", pt: "Processando no pool Tropico…", fr: "Traitement dans le pool Tropico…" },
  "pagomovil.receipt.title": { es: "Pago confirmado", en: "Payment confirmed", pt: "Pagamento confirmado", fr: "Paiement confirmé" },
  "pagomovil.receipt.ref": { es: "Referencia bancaria", en: "Bank reference", pt: "Referência bancária", fr: "Référence bancaire" },
  "pagomovil.receipt.txid": { es: "ID interno Tropico", en: "Tropico internal ID", pt: "ID interno Tropico", fr: "ID interne Tropico" },
  "pagomovil.receipt.download": { es: "Descargar comprobante", en: "Download receipt", pt: "Baixar comprovante", fr: "Télécharger reçu" },
  "pagomovil.receipt.share": { es: "Compartir por WhatsApp", en: "Share via WhatsApp", pt: "Compartilhar via WhatsApp", fr: "Partager via WhatsApp" },

  // QR errors
  "qr.error.invalid": { es: "QR no reconocido. Asegurate que sea un QR Suiche7B válido.", en: "QR not recognized. Make sure it's a valid Suiche7B QR.", pt: "QR não reconhecido. Verifique que seja um QR Suiche7B válido.", fr: "QR non reconnu. Vérifiez que c'est un QR Suiche7B valide." },
  "qr.error.camera": { es: "No pudimos abrir la cámara. Permití acceso en tu navegador.", en: "Could not open camera. Grant access in your browser.", pt: "Não foi possível abrir a câmera. Permita acesso no navegador.", fr: "Impossible d'ouvrir la caméra. Autorisez l'accès dans votre navigateur." },

  // Common
  "common.cancel": { es: "Cancelar", en: "Cancel", pt: "Cancelar", fr: "Annuler" },
  "common.close": { es: "Cerrar", en: "Close", pt: "Fechar", fr: "Fermer" },
  "common.back": { es: "Atrás", en: "Back", pt: "Voltar", fr: "Retour" },
  "common.lang": { es: "Idioma", en: "Language", pt: "Idioma", fr: "Langue" },
} as const satisfies Record<string, Entry>;

export type DictKey = keyof typeof dict;

export function translate(key: DictKey, lang: Lang): string {
  return dict[key][lang] ?? dict[key].es;
}
