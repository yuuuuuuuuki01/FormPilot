import { NextResponse } from "next/server";
import { runCollectionRule } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const result = await runCollectionRule(id);

  if (!result) {
    return NextResponse.json({ error: "Collection rule not found" }, { status: 404 });
  }

  return NextResponse.json(result, { status: 201 });
}
