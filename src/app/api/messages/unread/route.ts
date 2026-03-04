import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/messages/unread?userId=X — total unread count across all conversations
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ count: 0 });

  const uid = Number(userId);

  // Get all conversations for this user
  const convs = await prisma.conversation.findMany({
    where: { OR: [{ user1Id: uid }, { user2Id: uid }] },
    select: { id: true },
  });

  const ids = convs.map((c) => c.id);
  if (ids.length === 0) return NextResponse.json({ count: 0 });

  const count = await prisma.message.count({
    where: {
      conversationId: { in: ids },
      senderId: { not: uid },
      read: false,
    },
  });

  return NextResponse.json({ count });
}
