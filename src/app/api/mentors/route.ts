import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const schoolId = req.nextUrl.searchParams.get("schoolId");
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase();

  const mentors = await prisma.mentorProfile.findMany({
    where: schoolId ? { schoolId } : undefined,
    include: {
      user: true,
      school: true,
      subjects: true,
    },
    orderBy: { rating: "desc" },
  });

  const result = mentors
    .filter((m) => {
      if (!q) return true;
      return (
        m.user.name.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q) ||
        m.subjects.some((s) => s.courseCode.toLowerCase().includes(q))
      );
    })
    .map((m) => ({
      id: m.id,
      name: m.user.name,
      year: m.user.grade,
      initials: m.user.initials,
      avatarColor: m.user.avatarColor,
      subjects: m.subjects.map((s) => s.courseCode),
      rating: m.rating,
      sessions: m.sessionCount,
      available: m.available,
      bio: m.bio,
      school: { id: m.school.id, name: m.school.name, city: m.school.city, emoji: m.school.emoji },
    }));

  return NextResponse.json(result);
}
