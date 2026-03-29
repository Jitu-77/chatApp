import jwt from "jsonwebtoken";
import { handleChatEvents } from "./handler/chatHandler.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔥 Track user sockets
const userSocketMap = new Map();

export const initSocket = (io) => {
  // console.log("Socket initialized",io);

  // 🔐 SOCKET AUTH
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("No token provided"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
      );

      socket.user = decoded;

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    console.log("User connected:", socket.id, "User:", userId);

    // =========================
    // 🔥 TRACK SOCKETS
    // =========================
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }

    userSocketMap.get(userId).add(socket.id);

    // =========================
    // 🔥 JOIN PERSONAL ROOM
    // =========================
    socket.join(`user_${userId}`);

    // =========================
    // 🔥 EMIT ONLINE (ONLY FIRST TIME)
    // =========================
    if (userSocketMap.get(userId).size === 1) {
      io.emit("user_online", userId);
    }

    // =========================
    // 🔥 CHAT EVENTS
    // =========================
    handleChatEvents(socket, io);

    // =========================
    // 🔥 DISCONNECT LOGIC
    // =========================
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      const sockets = userSocketMap.get(userId);

      if (sockets) {
        sockets.delete(socket.id);

        // 🔥 If NO active sockets → OFFLINE
        if (sockets.size === 0) {
          userSocketMap.delete(userId);

          io.emit("user_offline", userId);

          // 🔥 OPTIONAL: update last seen
          await prisma.user.update({
            where: { id: userId },
            data: { lastSeen: new Date() },
          });
        }
      }
    });
  });
};