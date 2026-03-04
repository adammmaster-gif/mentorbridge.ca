import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const courseCode = req.nextUrl.searchParams.get("courseCode");
  const schoolId = req.nextUrl.searchParams.get("schoolId");
  const mentorId = req.nextUrl.searchParams.get("mentorId");

  const where: Record<string, unknown> = {};
  if (courseCode) where.courseCode = courseCode;
  if (schoolId) where.schoolId = schoolId;
  if (mentorId) where.mentorId = Number(mentorId);

  const notes = await prisma.studyNote.findMany({
    where,
    include: { mentor: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    notes.map((n) => ({
      id: n.id,
      mentorId: n.mentorId,
      mentorName: n.mentor.name,
      mentorInitials: n.mentor.initials,
      mentorAvatarColor: n.mentor.avatarColor,
      courseCode: n.courseCode,
      courseName: n.courseName,
      title: n.title,
      content: n.content,
      createdAt: n.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mentorId, schoolId, courseCode, courseName, title, content } = body;

  if (!mentorId || !schoolId || !courseCode || !courseName || !title || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const note = await prisma.studyNote.create({
    data: {
      mentorId: Number(mentorId),
      schoolId,
      courseCode,
      courseName,
      title: title.trim(),
      content: content.trim(),
    },
    include: { mentor: true },
  });

  return NextResponse.json({
    id: note.id,
    mentorId: note.mentorId,
    mentorName: note.mentor.name,
    mentorInitials: note.mentor.initials,
    mentorAvatarColor: note.mentor.avatarColor,
    courseCode: note.courseCode,
    courseName: note.courseName,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
  }, { status: 201 });
}
