import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postSystemMessage } from "@/lib/messaging";

// Auto-complete sessions whose time has fully passed
async function autoComplete(sessionIds: number[]) {
  if (sessionIds.length === 0) return;
  await prisma.session.updateMany({
    where: { id: { in: sessionIds }, status: "upcoming" },
    data: { status: "completed" },
  });
  // Confirm their volunteer hours too
  await prisma.volunteerHour.updateMany({
    where: { sessionId: { in: sessionIds }, status: "pending" },
    data: { status: "confirmed" },
  });
}

function resolveStatus(status: string, scheduledDate: Date, durationMinutes: number): string {
  if (status === "upcoming") {
    const endTime = new Date(scheduledDate.getTime() + durationMinutes * 60 * 1000);
    if (endTime < new Date()) return "completed";
  }
  return status;
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const role = req.nextUrl.searchParams.get("role") ?? "learner";
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  if (role === "mentor") {
    const profile = await prisma.mentorProfile.findFirst({ where: { userId: Number(userId) } });
    if (!profile) return NextResponse.json([]);

    const sessions = await prisma.session.findMany({
      where: { mentorProfileId: profile.id },
      include: { learner: true },
      orderBy: { scheduledDate: "desc" },
    });

    // Auto-complete any that have passed
    const toComplete = sessions
      .filter((s) => resolveStatus(s.status, s.scheduledDate, s.durationMinutes) === "completed" && s.status === "upcoming")
      .map((s) => s.id);
    await autoComplete(toComplete);

    return NextResponse.json(
      sessions.map((s) => ({
        id: s.id,
        courseCode: s.courseCode,
        courseName: s.courseName,
        mentorName: "",
        learnerName: s.learner.name,
        scheduledDate: s.scheduledDate.toISOString(),
        durationMinutes: s.durationMinutes,
        status: resolveStatus(s.status, s.scheduledDate, s.durationMinutes),
        location: s.location,
      }))
    );
  }

  // Learner view
  const sessions = await prisma.session.findMany({
    where: { learnerId: Number(userId) },
    include: { mentor: { include: { user: true } } },
    orderBy: { scheduledDate: "desc" },
  });

  const toComplete = sessions
    .filter((s) => resolveStatus(s.status, s.scheduledDate, s.durationMinutes) === "completed" && s.status === "upcoming")
    .map((s) => s.id);
  await autoComplete(toComplete);

  return NextResponse.json(
    sessions.map((s) => ({
      id: s.id,
      courseCode: s.courseCode,
      courseName: s.courseName,
      mentorName: s.mentor.user.name,
      learnerName: "",
      scheduledDate: s.scheduledDate.toISOString(),
      durationMinutes: s.durationMinutes,
      status: resolveStatus(s.status, s.scheduledDate, s.durationMinutes),
      location: s.location,
    }))
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { learnerId, mentorProfileId, courseCode, courseName, scheduledDate, durationMinutes, location, notes } = body;

  if (!learnerId || !mentorProfileId || !courseCode || !courseName || !scheduledDate || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: Number(mentorProfileId) },
    include: { user: true },
  });
  if (!mentor) return NextResponse.json({ error: "Mentor not found" }, { status: 404 });

  const learner = await prisma.user.findUnique({ where: { id: Number(learnerId) } });

  const session = await prisma.session.create({
    data: {
      learnerId: Number(learnerId),
      mentorProfileId: Number(mentorProfileId),
      courseCode,
      courseName,
      scheduledDate: new Date(scheduledDate),
      durationMinutes: durationMinutes ?? 60,
      status: "pending",
      location,
      notes: notes ?? "",
    },
  });

  // Create a pending volunteer hour (will be confirmed when mentor approves)
  await prisma.volunteerHour.create({
    data: {
      mentorId: mentor.userId,
      sessionId: session.id,
      durationMinutes: session.durationMinutes,
      status: "pending",
    },
  });

  // Optional email notification to mentor via Resend
  if (process.env.RESEND_API_KEY && mentor.user.email) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "MentorBridge <onboarding@resend.dev>",
        to: mentor.user.email,
        subject: `New session request — ${courseCode}`,
        html: `
          <p>Hi ${mentor.user.name},</p>
          <p><strong>${learner?.name ?? "A student"}</strong> has requested a session with you.</p>
          <ul>
            <li><strong>Course:</strong> ${courseCode} — ${courseName}</li>
            <li><strong>Location:</strong> ${location}</li>
            <li><strong>Date:</strong> ${new Date(scheduledDate).toLocaleString()}</li>
          </ul>
          <p>Log in to MentorBridge to confirm or decline.</p>
        `,
      });
    } catch {
      // Email failure is non-fatal
    }
  }

  // System message in conversation: learner → mentor
  const dateStr = new Date(scheduledDate).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  await postSystemMessage(
    Number(learnerId),
    mentor.userId,
    `📅 New session request — ${courseCode} at ${location} on ${dateStr}`
  );

  return NextResponse.json(session, { status: 201 });
}
