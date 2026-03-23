import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/domain";
import { createCollectionRule } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getDashboardData();
  return NextResponse.json({ rules: data.rules });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    industries?: string[];
    regions?: string[];
    keywords?: string[];
    excludeTerms?: string[];
    sources?: ("search" | "directory")[];
    runCadence?: string;
  };

  if (!body.name || !body.sources?.length) {
    return NextResponse.json({ error: "name and sources are required" }, { status: 400 });
  }

  const rule = await createCollectionRule({
    name: body.name,
    industries: body.industries ?? [],
    regions: body.regions ?? [],
    keywords: body.keywords ?? [],
    excludeTerms: body.excludeTerms ?? [],
    sources: body.sources,
    runCadence: body.runCadence ?? "manual"
  });

  return NextResponse.json({ rule }, { status: 201 });
}
