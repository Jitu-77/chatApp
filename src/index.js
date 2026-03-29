import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes.js";
import conversationRouter from "./routes/conversation.routes.js";
import { initSocket } from "./socket/socket.js";
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    // origin: process.env.CORS_ORIGIN,
        origin: function (origin, callback) {
      // allow all origins
      callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  }),
);

app.use(express.static("public"));
app.use(cookieParser());

// Server + Socket
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: process.env.CORS_ORIGIN,
    origin: function (origin, callback) {
      // allow all origins
      callback(null, true);
    },
  },
});
// 👇 initialize socket separately
initSocket(io);
// moved to socket 
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);
// });

// Routes
app.get("/health", (req, res) => {
  res.send("Server is running 🚀");
});

app.use("/api/auth", userRouter);

app.use("/api/conversation", conversationRouter);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
