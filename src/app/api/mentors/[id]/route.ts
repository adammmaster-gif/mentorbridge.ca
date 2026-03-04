import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const m = await prisma.mentorProfile.findUnique({
    where: { id: Number(id) },
    include: { user: true, school: true, subjects: true },
  });
  if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
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
  });
}
