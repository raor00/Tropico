import { redirect } from "next/navigation";

/**
 * /intercambio-p2p quedó deprecated — su funcionalidad vive ahora dentro
 * de /cambiar (tab "Bolívares ↔ USDC"). Redirigimos cualquier link viejo.
 */
export default function IntercambioP2PRedirect() {
  redirect("/cambiar");
}
