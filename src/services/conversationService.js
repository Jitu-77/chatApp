
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
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
export const createOrGetConversation = async (userId, otherUserId) => {
  // 🔍 check existing 1-1 conversation ONLY
  let conversation = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [
        { users: { some: { id: userId } } },
        { users: { some: { id: otherUserId } } },
      ],
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        users: {
          connect: [{ id: userId }, { id: otherUserId }],
        },
      },
    });
  }

  return conversation;
};

export const deleteConversationById = async (conversationId) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      return false;
    }

    // 🔥 delete messages first (IMPORTANT)
    await prisma.message.deleteMany({
      where: {
        conversationId,
      },
    });

    // 🔥 delete conversation
    const deleted = await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });

    return deleted;

  } catch (error) {
    console.error("Delete conversation error:", error);
    return false;
  }
};
export const createGroupConversation = async (userIds, name) => {
  return prisma.conversation.create({
    data: {
      isGroup: true,
      name,
      users: {
        connect: userIds.map((id) => ({ id })),
      },
    },
  });
};
export const updateGroupConversation = async ({
  userId,
  conversationId,
  name,
  profilePic,
  addUserIds = [],
  removeUserIds = [],
}) => {

  // 🔍 check if user belongs to conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      users: {
        some: { id: userId },
      },
    },
    include: {
      users: true,
    },
  });

  if (!conversation) {
    const error = new Error("Not allowed");
    error.status = 403;
    throw error;
  }

  if (!conversation.isGroup) {
    const error = new Error("Not a group conversation");
    error.status = 400;
    throw error;
  }

  // 🧠 Prevent removing self accidentally
  if (removeUserIds.includes(userId)) {
    const error = new Error("You cannot remove yourself from group");
    error.status = 400;
    throw error;
  }

  // 🧠 Remove duplicates (safe handling)
  const uniqueAddUsers = [...new Set(addUserIds)];
  const uniqueRemoveUsers = [...new Set(removeUserIds)];

  // 🔥 Update conversation
  const updated = await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      name: name ?? undefined,
      profilePic: profilePic ?? undefined,

      users: {
        connect: uniqueAddUsers.map((id) => ({ id })),
        disconnect: uniqueRemoveUsers.map((id) => ({ id })),
      },
    },
    include: {
      users: true,
    },
  });

  return updated;
};

export const leaveGroupService = async ({ userId, conversationId }) => {

  // 🔍 check if conversation exists and user is part of it
  try {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      users: {
        some: { id: userId },
      },
    },
    include: {
      users: true,
    },
  });

  if (!conversation) {
    const error = new Error("Conversation not found or access denied");
    error.status = 403;
    throw error;
  }

  if (!conversation.isGroup) {
    const error = new Error("Not a group conversation");
    error.status = 400;
    throw error;
  }

  // 🧠 Optional: prevent last user leaving (edge case)
  if (conversation.users.length === 1) {
    const error = new Error("Cannot leave group as last member");
    error.status = 400;
    throw error;
  }

  // 🔥 remove user from group
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      users: {
        disconnect: { id: userId },
      },
    },
  });

  return true;    
  } catch (error) {
    return false;    
  }

};


export const getMessagesByConversationId = async({ conversationId, userId }) => {
    const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      users: {
        some: { id: userId },
      },
    },
  });
    if (!conversation) {
    const error = new Error("Access denied or conversation not found");
    error.status = 403;
    throw error;
  }
    return prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "asc", // ✅ correct for chat UI
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePic: true,
        },
      },
    },
  });
}
