import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postSystemMessage } from "@/lib/messaging";

type Params = { params: Promise<{ id: string }> };

// POST /api/study-groups/[id]/join — learner joins
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { learnerId } = await req.json();
  if (!learnerId) return NextResponse.json({ error: "learnerId required" }, { status: 400 });

  const group = await prisma.studyGroup.findUnique({
    where: { id: Number(id) },
    include: { members: true, mentor: true },
  });
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  if (group.members.length >= group.maxStudents) {
    return NextResponse.json({ error: "Group is full" }, { status: 409 });
  }

  const already = group.members.find((m) => m.learnerId === Number(learnerId));
  if (already) return NextResponse.json({ error: "Already joined" }, { status: 409 });

  await prisma.studyGroupMember.create({
    data: { studyGroupId: Number(id), learnerId: Number(learnerId) },
  });

  // Notify mentor
  const learner = await prisma.user.findUnique({ where: { id: Number(learnerId) } });
  await postSystemMessage(
    Number(learnerId),
    group.mentorId,
    `🧑‍🤝‍🧑 ${learner?.name ?? "A student"} joined your ${group.courseCode} study group — "${group.title}"`
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}

// DELETE /api/study-groups/[id]/join — learner leaves
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { learnerId } = await req.json();
  if (!learnerId) return NextResponse.json({ error: "learnerId required" }, { status: 400 });

  await prisma.studyGroupMember.deleteMany({
    where: { studyGroupId: Number(id), learnerId: Number(learnerId) },
  });

  return NextResponse.json({ ok: true });
}
