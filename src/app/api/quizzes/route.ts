import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface QuestionInput {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export async function GET(req: NextRequest) {
  const schoolId = req.nextUrl.searchParams.get("schoolId");
  const courseCode = req.nextUrl.searchParams.get("courseCode");
  const mentorId = req.nextUrl.searchParams.get("mentorId");

  if (!schoolId) {
    return NextResponse.json({ error: "schoolId required" }, { status: 400 });
  }

  const where: Record<string, unknown> = { schoolId };
  if (courseCode) where.courseCode = courseCode;
  if (mentorId) where.mentorId = Number(mentorId);

  const quizzes = await prisma.quiz.findMany({
    where,
    include: {
      mentor: true,
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    quizzes.map((q) => ({
      id: q.id,
      mentorId: q.mentorId,
      mentorName: q.mentor.name,
      mentorInitials: q.mentor.initials,
      mentorAvatarColor: q.mentor.avatarColor,
      courseCode: q.courseCode,
      courseName: q.courseName,
      title: q.title,
      difficulty: q.difficulty,
      sourceNoteId: q.sourceNoteId,
      questionCount: q._count.questions,
      attemptCount: q._count.attempts,
      createdAt: q.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mentorId, schoolId, courseCode, courseName, title, questions } = body as {
    mentorId: number;
    schoolId: string;
    courseCode: string;
    courseName: string;
    title: string;
    questions: QuestionInput[];
  };

  if (!mentorId || !schoolId || !courseCode || !courseName || !title?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "At least one question is required" }, { status: 400 });
  }

  const quiz = await prisma.quiz.create({
    data: {
      mentorId: Number(mentorId),
      schoolId,
      courseCode,
      courseName,
      title: title.trim(),
      difficulty: "medium",
      questions: {
        create: questions.map((q, i) => ({
          questionText: q.questionText.trim(),
          options: JSON.stringify(q.options.map((o) => o.trim())),
          correctAnswer: String(q.correctAnswer),
          explanation: (q.explanation ?? "").trim(),
          order: i,
        })),
      },
    },
    include: {
      mentor: true,
      _count: { select: { questions: true, attempts: true } },
    },
  });

  return NextResponse.json(
    {
      id: quiz.id,
      mentorId: quiz.mentorId,
      mentorName: quiz.mentor.name,
      mentorInitials: quiz.mentor.initials,
      mentorAvatarColor: quiz.mentor.avatarColor,
      courseCode: quiz.courseCode,
      courseName: quiz.courseName,
      title: quiz.title,
      difficulty: quiz.difficulty,
      sourceNoteId: quiz.sourceNoteId,
      questionCount: quiz._count.questions,
      attemptCount: quiz._count.attempts,
      createdAt: quiz.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
