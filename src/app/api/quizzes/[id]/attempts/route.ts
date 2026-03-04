import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const learnerId = req.nextUrl.searchParams.get("learnerId");
  const quizId = Number(id);

  if (!learnerId) {
    return NextResponse.json({ error: "learnerId required" }, { status: 400 });
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId, learnerId: Number(learnerId) },
    include: { quiz: true },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(
    attempts.map((a) => ({
      id: a.id,
      quizId: a.quizId,
      quizTitle: a.quiz.title,
      score: a.score,
      correctAnswers: a.correctAnswers,
      totalQuestions: a.totalQuestions,
      completed: a.completed,
      completedAt: a.completedAt ? a.completedAt.toISOString() : null,
      startedAt: a.startedAt.toISOString(),
      responses: JSON.parse(a.responses) as Record<string, string>,
    }))
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { learnerId } = body;
  const quizId = Number(id);

  if (!learnerId) {
    return NextResponse.json({ error: "learnerId required" }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { _count: { select: { questions: true } } },
  });

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      learnerId: Number(learnerId),
      totalQuestions: quiz._count.questions,
      responses: "{}",
    },
    include: { quiz: true },
  });

  return NextResponse.json(
    {
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quiz.title,
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      completed: attempt.completed,
      completedAt: null,
      startedAt: attempt.startedAt.toISOString(),
      responses: {},
    },
    { status: 201 }
  );
}
