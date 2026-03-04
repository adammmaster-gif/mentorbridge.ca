import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  const { id, attemptId } = await params;
  const quizId = Number(id);
  const attemptIdNum = Number(attemptId);

  const body = await req.json();
  const { responses } = body as { responses: Record<string, string> };

  if (!responses || typeof responses !== "object") {
    return NextResponse.json({ error: "responses required" }, { status: 400 });
  }

  const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptIdNum } });
  if (!attempt || attempt.quizId !== quizId) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }
  if (attempt.completed) {
    return NextResponse.json({ error: "Attempt already completed" }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const correctAnswers = quiz.questions.filter(
    (q) => responses[String(q.id)] === q.correctAnswer
  ).length;
  const totalQuestions = quiz.questions.length;
  const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const updated = await prisma.quizAttempt.update({
    where: { id: attemptIdNum },
    data: {
      responses: JSON.stringify(responses),
      score,
      correctAnswers,
      completed: true,
      completedAt: new Date(),
    },
    include: { quiz: true },
  });

  return NextResponse.json({
    id: updated.id,
    quizId: updated.quizId,
    quizTitle: updated.quiz.title,
    score: updated.score,
    correctAnswers: updated.correctAnswers,
    totalQuestions: updated.totalQuestions,
    completed: updated.completed,
    completedAt: updated.completedAt ? updated.completedAt.toISOString() : null,
    startedAt: updated.startedAt.toISOString(),
    responses: JSON.parse(updated.responses) as Record<string, string>,
  });
}
