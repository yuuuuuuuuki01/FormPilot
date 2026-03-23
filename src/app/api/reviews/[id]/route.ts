import { NextResponse } from "next/server";
import { updateReviewItem } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    assignee?: string;
    detail?: string;
    retryAllowed?: boolean;
  };

  const review = await updateReviewItem(id, body);

  if (!review) {
    return NextResponse.json({ error: "Review item not found" }, { status: 404 });
  }

  return NextResponse.json({ review });
}
