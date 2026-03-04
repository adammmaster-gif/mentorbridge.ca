import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/study-groups?q=X&learnerId=Y — search open groups
export async function GET(req: NextRequest) {
  const q         = req.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";
  const learnerId = req.nextUrl.searchParams.get("learnerId");
  const mentorId  = req.nextUrl.searchParams.get("mentorId");

  const now = new Date();

  const groups = await prisma.studyGroup.findMany({
    where: mentorId
      ? { mentorId: Number(mentorId) }
      : {
          scheduledDate: { gt: now },
          ...(q ? {
            OR: [
              { courseCode: { contains: q } },
              { courseName: { contains: q } },
              { title:      { contains: q } },
            ],
          } : {}),
        },
    include: {
      mentor:  true,
      members: true,
    },
    orderBy: { scheduledDate: "asc" },
  });

  const lid = learnerId ? Number(learnerId) : null;

  return NextResponse.json(
    groups.map((g) => ({
      id:             g.id,
      mentorId:       g.mentorId,
      mentorName:     g.mentor.name,
      mentorInitials: g.mentor.initials,
      mentorAvatarColor: g.mentor.avatarColor,
      courseCode:     g.courseCode,
      courseName:     g.courseName,
      title:          g.title,
      scheduledDate:  g.scheduledDate.toISOString(),
      durationMinutes: g.durationMinutes,
      location:       g.location,
      maxStudents:    g.maxStudents,
      memberCount:    g.members.length,
      alreadyJoined:  lid ? g.members.some((m) => m.learnerId === lid) : false,
    }))
  );
}

// POST /api/study-groups — mentor creates a group
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mentorId, courseCode, courseName, title, scheduledDate, durationMinutes, location, maxStudents } = body;

  if (!mentorId || !courseCode || !courseName || !title || !scheduledDate || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const group = await prisma.studyGroup.create({
    data: {
      mentorId:       Number(mentorId),
      courseCode,
      courseName,
      title,
      scheduledDate:  new Date(scheduledDate),
      durationMinutes: durationMinutes ?? 60,
      location,
      maxStudents:    maxStudents ?? 4,
    },
  });

  return NextResponse.json(group, { status: 201 });
}
