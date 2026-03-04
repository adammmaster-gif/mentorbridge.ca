import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const noteId = Number(id);
  const mentorId = req.nextUrl.searchParams.get("mentorId");

  const note = await prisma.studyNote.findUnique({ where: { id: noteId } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (mentorId && note.mentorId !== Number(mentorId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.studyNote.delete({ where: { id: noteId } });
  return NextResponse.json({ ok: true });
}
