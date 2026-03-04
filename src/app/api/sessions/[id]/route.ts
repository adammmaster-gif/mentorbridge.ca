import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postSystemMessage } from "@/lib/messaging";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status || !["upcoming", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id: Number(id) },
    include: { mentor: { include: { user: true } } },
  });
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const updated = await prisma.session.update({
    where: { id: Number(id) },
    data: { status },
  });

  const mentorName = session.mentor.user.name;
  const mentorUserId = session.mentor.user.id;

  if (status === "upcoming") {
    await postSystemMessage(
      mentorUserId,
      session.learnerId,
      `✅ ${mentorName} confirmed your ${session.courseCode} session at ${session.location}`
    );
  } else {
    await postSystemMessage(
      mentorUserId,
      session.learnerId,
      `❌ ${mentorName} declined your ${session.courseCode} session request`
    );
  }

  // Optional: email the learner
  if (status === "upcoming" && process.env.RESEND_API_KEY) {
    try {
      const learner = await prisma.user.findUnique({ where: { id: session.learnerId } });
      if (learner?.email) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "MentorBridge <onboarding@resend.dev>",
          to: learner.email,
          subject: `Session confirmed — ${session.courseCode}`,
          html: `<p>Your session for <strong>${session.courseCode}</strong> at <strong>${session.location}</strong> has been confirmed!</p>`,
        });
      }
    } catch {
      // Email failure is non-fatal
    }
  }

  return NextResponse.json(updated);
}
