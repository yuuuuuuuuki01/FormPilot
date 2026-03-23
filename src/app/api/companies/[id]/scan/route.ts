import { NextResponse } from "next/server";
import { scanCompany } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const result = await scanCompany(id);

  if (!result) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json(result, { status: 201 });
}
