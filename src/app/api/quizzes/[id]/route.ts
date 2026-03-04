import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quizId = Number(id);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      mentor: true,
      questions: { orderBy: { order: "asc" } },
      _count: { select: { attempts: true } },
    },
  });

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  return NextResponse.json({
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
    questionCount: quiz.questions.length,
    attemptCount: quiz._count.attempts,
    createdAt: quiz.createdAt.toISOString(),
    questions: quiz.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: JSON.parse(q.options) as string[],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      order: q.order,
    })),
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mentorId = req.nextUrl.searchParams.get("mentorId");
  const quizId = Number(id);

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }
  if (mentorId && quiz.mentorId !== Number(mentorId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.quiz.delete({ where: { id: quizId } });
  return NextResponse.json({ ok: true });
}
