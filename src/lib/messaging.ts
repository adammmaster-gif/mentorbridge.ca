import { prisma } from "@/lib/prisma";

/**
 * Get-or-create a conversation between two users (ordered by id to satisfy unique constraint),
 * then post a system message into it. Returns silently on error.
 */
export async function postSystemMessage(userAId: number, userBId: number, text: string) {
  try {
    const a = Math.min(userAId, userBId);
    const b = Math.max(userAId, userBId);

    let conv = await prisma.conversation.findUnique({
      where: { user1Id_user2Id: { user1Id: a, user2Id: b } },
    });
    if (!conv) {
      conv = await prisma.conversation.create({ data: { user1Id: a, user2Id: b } });
    }

    await prisma.message.create({
      data: { conversationId: conv.id, senderId: a, text, isSystem: true },
    });

    await prisma.conversation.update({
      where: { id: conv.id },
      data: { updatedAt: new Date() },
    });
  } catch {
    // Non-fatal
  }
}
