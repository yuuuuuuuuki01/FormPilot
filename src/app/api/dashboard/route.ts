import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/domain";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getDashboardData());
}
