export const getUserConversations = async (userId) => {
  return prisma.conversation.findMany({
    where: {
      users: {
        some: { id: userId },
      },
    },
    include: {
      users: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc", // fallback sorting
    },
  });
};