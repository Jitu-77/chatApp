import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getUserConversations = async (userId) => {
  return prisma.conversation.findMany({
    where: {
      users: {
        some: { id: userId }, //join
      },
    },
    include: {
      users: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1, // only last message
      },
    },
  });
}