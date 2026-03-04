import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");
  const schools = await prisma.school.findMany({
    where: city ? { city } : undefined,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(schools);
}
