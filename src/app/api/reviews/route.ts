import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/domain";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getDashboardData();
  return NextResponse.json({ reviews: data.reviews });
}
