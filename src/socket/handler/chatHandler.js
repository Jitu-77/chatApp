import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const handleChatEvents = (socket, io) => {

  // ======================
  // JOIN CONVERSATION
  // ======================
  socket.on("join_conversation", async (conversationId) => {
    try {
      const userId = socket.user.id;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          users: {
            some: { id: userId },
          },
        },
      });

      if (!conversation) {
        return socket.emit("error", {
          message: "Unauthorized access",
        });
      }

      const room = `conversation_${conversationId}`;
      socket.join(room);

      console.log(`User ${userId} joined ${room}`);
    } catch (err) {
      console.error("Join error:", err);
    }
  });

  // ======================
  // SEND MESSAGE
  // ======================
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, content } = data;
      const senderId = socket.user.id;

      // 🔐 Validate membership
      const isValid = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          users: {
            some: { id: senderId },
          },
        },
      });

      if (!isValid) {
        return socket.emit("message_error", {
          error: "Unauthorized",
        });
      }

      // 💾 Save message
      const message = await prisma.message.create({
        data: {
          content,
          conversationId,
          senderId,
          status: "sent",
        },
      });

      const room = `conversation_${conversationId}`;

      // 📤 Send to others
      socket.to(room).emit("receive_message", message);

      // ✅ ACK sender
      socket.emit("message_sent", message);
    // =========================
    // 🔥 DASHBOARD UPDATE LOGIC
    // =========================
    // FIRST FIND THE USERS OF THE ONGOING CONVERSATION
    // THEN EMIT THE DASHBOARD_UPDATE EVENT FOR ALL THE ASSOCIATED USERS 
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { users: true },
    });

    conversation.users.forEach((user) => {
      io.to(`user_${user.id}`).emit("dashboard_update", {
        conversationId,
        lastMessage: message.content,
        lastMessageTime: message.createdAt,
      });
    });
 

    } catch (err) {
      console.error("Send message error:", err);

      socket.emit("message_error", {
        error: "Failed to send message",
      });
    }
  });

  // ======================
  // TYPING INDICATOR
  // ======================
  socket.on("typing", ({ conversationId }) => {
    const room = `conversation_${conversationId}`;

    socket.to(room).emit("user_typing", {
      userId: socket.user.id,
    });
  });

  socket.on("stop_typing", ({ conversationId }) => {
    const room = `conversation_${conversationId}`;

    socket.to(room).emit("user_stop_typing", {
      userId: socket.user.id,
    });
  });

  // ======================
  // MESSAGE DELIVERED
  // ======================
  socket.on("message_delivered", async ({ messageId }) => {
    try {
      await prisma.message.update({
        where: { id: messageId },
        data: { status: "delivered" },
      });
    } catch (err) {
      console.error("Delivery error:", err);
    }
  });

  // ======================
  // MESSAGE READ
  // ======================
  socket.on("message_read", async ({ conversationId }) => {
    try {
      const userId = socket.user.id;

      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: {
            not: userId, // only messages from others
          },
        },
        data: {
          status: "read",
        },
      });

      const room = `conversation_${conversationId}`;

      io.to(room).emit("messages_read", {
        conversationId,
      });

    } catch (err) {
      console.error("Read error:", err);
    }
  });
};