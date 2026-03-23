import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/domain";
import { updateSendPolicy } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getDashboardData();
  return NextResponse.json({ policy: data.policy });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    timezone?: string;
    allowedWeekdays?: number[];
    startHour?: number;
    endHour?: number;
    blockJapaneseHolidays?: boolean;
    minHoursBetweenSends?: number;
  };

  const policy = await updateSendPolicy(body);
  return NextResponse.json({ policy });
}
