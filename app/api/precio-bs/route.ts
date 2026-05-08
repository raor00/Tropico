import { NextResponse } from "next/server";
import { fetchPrecioBs } from "@/lib/precio-bs";

export const runtime = "edge";
export const revalidate = 30;

export async function GET() {
  const precio = await fetchPrecioBs();
  return NextResponse.json(precio, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
