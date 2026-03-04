import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postSystemMessage } from "@/lib/messaging";

// GET /api/mentors/me?userId=X — fetch this mentor's current subjects
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const profile = await prisma.mentorProfile.findFirst({
    where: { userId: Number(userId) },
    include: { subjects: true },
  });
  if (!profile) return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });

  return NextResponse.json({ subjects: profile.subjects.map((s) => s.courseCode), bio: profile.bio });
}

// PATCH /api/mentors/me?userId=X — replace subjects with new list
export async function PATCH(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const body = await req.json() as { subjects: string[]; bio?: string };
  const { subjects, bio } = body;
  if (!Array.isArray(subjects)) return NextResponse.json({ error: "subjects must be an array" }, { status: 400 });

  const profile = await prisma.mentorProfile.findFirst({
    where: { userId: Number(userId) },
    include: { subjects: true },
  });
  if (!profile) return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });

  // Find newly added course codes (not in the old list)
  const oldCodes = new Set(profile.subjects.map((s) => s.courseCode));
  const newlyCovered = subjects.filter((code) => !oldCodes.has(code));

  // Update bio if provided
  if (bio !== undefined) {
    await prisma.mentorProfile.update({ where: { id: profile.id }, data: { bio } });
  }

  // Delete all existing subjects then re-insert
  await prisma.mentorSubject.deleteMany({ where: { mentorProfileId: profile.id } });
  if (subjects.length > 0) {
    await prisma.mentorSubject.createMany({
      data: subjects.map((code) => ({ mentorProfileId: profile.id, courseCode: code })),
    });
  }

  // Notify waitlisted learners for any newly added courses
  if (newlyCovered.length > 0) {
    const mentor = await prisma.user.findUnique({ where: { id: Number(userId) } });
    const mentorName = mentor?.name ?? "A mentor";

    for (const code of newlyCovered) {
      const waiting = await prisma.courseWaitlist.findMany({ where: { courseCode: code } });
      for (const entry of waiting) {
        await postSystemMessage(
          Number(userId),
          entry.learnerId,
          `🔔 ${mentorName} is now available to help with ${code}! Head to Explore to book a session.`
        );
        // Remove from waitlist now that a mentor is available
        await prisma.courseWaitlist.delete({ where: { id: entry.id } });
      }
    }
  }

  return NextResponse.json({ subjects });
}
