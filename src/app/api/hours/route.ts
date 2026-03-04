import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VOLUNTEER_GOAL_MINUTES = 40 * 60; // 40 hours in minutes

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const hours = await prisma.volunteerHour.findMany({
    where: { mentorId: Number(userId) },
    include: {
      session: {
        include: { learner: true },
      },
    },
    orderBy: { loggedAt: "desc" },
  });

  const totalMinutes = hours
    .filter((h) => h.status === "confirmed")
    .reduce((sum, h) => sum + h.durationMinutes, 0);

  const totalHours = (totalMinutes / 60).toFixed(1);
  const percentage = Math.min(100, Math.round((totalMinutes / VOLUNTEER_GOAL_MINUTES) * 100));

  return NextResponse.json({
    totalMinutes,
    totalHours,
    percentage,
    log: hours.map((h) => ({
      id: h.id,
      date: h.loggedAt.toISOString(),
      subject: h.session.courseName,
      learnerName: h.session.learner.name,
      durationMinutes: h.durationMinutes,
      status: h.status,
    })),
  });
}
