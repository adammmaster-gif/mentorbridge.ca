import { NextRequest, NextResponse } from "next/server";
import { COURSES } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase();
  if (!q) return NextResponse.json(COURSES);

  // Filter to matching courses across all grades/departments
  const results: { code: string; name: string; type: string }[] = [];
  for (const grade of Object.values(COURSES)) {
    for (const courses of Object.values(grade)) {
      for (const c of courses) {
        if (c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) {
          results.push(c);
        }
      }
    }
  }
  return NextResponse.json(results);
}
