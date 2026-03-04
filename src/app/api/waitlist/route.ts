import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/waitlist?learnerId=X — list all waitlist entries for a learner
export async function GET(req: NextRequest) {
  const learnerId = req.nextUrl.searchParams.get("learnerId");
  if (!learnerId) return NextResponse.json({ error: "learnerId required" }, { status: 400 });

  const entries = await prisma.courseWaitlist.findMany({
    where: { learnerId: Number(learnerId) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries.map((e) => ({ id: e.id, courseCode: e.courseCode, createdAt: e.createdAt.toISOString() })));
}

// POST /api/waitlist — join waitlist { learnerId, courseCode }
export async function POST(req: NextRequest) {
  const { learnerId, courseCode } = await req.json();
  if (!learnerId || !courseCode) return NextResponse.json({ error: "learnerId and courseCode required" }, { status: 400 });

  // Check if already on waitlist
  const existing = await prisma.courseWaitlist.findUnique({
    where: { learnerId_courseCode: { learnerId: Number(learnerId), courseCode } },
  });
  if (existing) return NextResponse.json({ error: "Already on waitlist" }, { status: 409 });

  // Check if a mentor already covers this course — no need to waitlist
  const covered = await prisma.mentorSubject.findFirst({ where: { courseCode } });
  if (covered) return NextResponse.json({ error: "Mentors already available for this course" }, { status: 409 });

  const entry = await prisma.courseWaitlist.create({
    data: { learnerId: Number(learnerId), courseCode },
  });

  return NextResponse.json({ id: entry.id, courseCode: entry.courseCode, createdAt: entry.createdAt.toISOString() }, { status: 201 });
}

// DELETE /api/waitlist — leave waitlist { learnerId, courseCode }
export async function DELETE(req: NextRequest) {
  const { learnerId, courseCode } = await req.json();
  if (!learnerId || !courseCode) return NextResponse.json({ error: "learnerId and courseCode required" }, { status: 400 });

  await prisma.courseWaitlist.deleteMany({
    where: { learnerId: Number(learnerId), courseCode },
  });

  return NextResponse.json({ ok: true });
}
