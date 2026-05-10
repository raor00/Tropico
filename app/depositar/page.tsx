import { redirect } from "next/navigation";

/**
 * /depositar quedó deprecado.
 *
 * El flow Bs → USDC ahora vive en /cambiar tab "Bolívares ↔ USDC".
 * Mantenemos esta ruta como redirect para no romper links viejos
 * (header, marketing, bookmarks de usuarios).
 */
export default function DepositarPage() {
  redirect("/cambiar?tab=bs");
}
