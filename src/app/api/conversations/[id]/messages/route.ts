import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/conversations/[id]/messages — get all messages, mark as read for a user
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = req.nextUrl.searchParams.get("userId");

  const messages = await prisma.message.findMany({
    where: { conversationId: Number(id) },
    orderBy: { createdAt: "asc" },
  });

  // Mark messages as read for this user
  if (userId) {
    await prisma.message.updateMany({
      where: {
        conversationId: Number(id),
        senderId: { not: Number(userId) },
        read: false,
      },
      data: { read: true },
    });
  }

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      text: m.text,
      isSystem: m.isSystem,
      read: m.read,
      createdAt: m.createdAt.toISOString(),
    }))
  );
}

// POST /api/conversations/[id]/messages — send a message
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { senderId, text, isSystem } = await req.json();

  if (!senderId || !text) return NextResponse.json({ error: "senderId and text required" }, { status: 400 });

  const message = await prisma.message.create({
    data: {
      conversationId: Number(id),
      senderId: Number(senderId),
      text,
      isSystem: isSystem ?? false,
    },
  });

  // Touch conversation updatedAt
  await prisma.conversation.update({
    where: { id: Number(id) },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    id: message.id,
    senderId: message.senderId,
    text: message.text,
    isSystem: message.isSystem,
    read: message.read,
    createdAt: message.createdAt.toISOString(),
  }, { status: 201 });
}
