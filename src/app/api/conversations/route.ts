import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/conversations?userId=X — list all conversations for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const uid = Number(userId);

  const convs = await prisma.conversation.findMany({
    where: { OR: [{ user1Id: uid }, { user2Id: uid }] },
    include: {
      user1: true,
      user2: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Compute unread counts for each conversation in one query
  const unreadCounts = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      conversationId: { in: convs.map((c) => c.id) },
      senderId: { not: uid },
      read: false,
    },
    _count: { id: true },
  });
  const unreadMap = new Map(unreadCounts.map((u) => [u.conversationId, u._count.id]));

  return NextResponse.json(
    convs.map((c) => {
      const other = c.user1Id === uid ? c.user2 : c.user1;
      const last  = c.messages[0];
      return {
        id: c.id,
        otherUser: { id: other.id, name: other.name, initials: other.initials, avatarColor: other.avatarColor, role: other.role },
        lastMessage: last?.text ?? "",
        unreadCount: unreadMap.get(c.id) ?? 0,
        updatedAt: c.updatedAt.toISOString(),
      };
    })
  );
}

// POST /api/conversations — get-or-create conversation between two users
export async function POST(req: NextRequest) {
  const { user1Id, user2Id } = await req.json();
  if (!user1Id || !user2Id) return NextResponse.json({ error: "user1Id and user2Id required" }, { status: 400 });

  const a = Math.min(Number(user1Id), Number(user2Id));
  const b = Math.max(Number(user1Id), Number(user2Id));

  const existing = await prisma.conversation.findUnique({
    where: { user1Id_user2Id: { user1Id: a, user2Id: b } },
  });
  if (existing) return NextResponse.json(existing);

  const created = await prisma.conversation.create({
    data: { user1Id: a, user2Id: b },
  });
  return NextResponse.json(created, { status: 201 });
}
