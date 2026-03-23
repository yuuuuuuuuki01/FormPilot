import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/domain";

export function GET() {
  return NextResponse.json({ rules: getDashboardData().rules });
}
