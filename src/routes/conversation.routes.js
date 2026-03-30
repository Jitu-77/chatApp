import { Router } from "express";
import { verifyToken } from  "../middlewares/authMiddleware.js"
import {getConversations,createConversation,
        deleteConversation,createGroupConv,updateGroupConv,
        leaveGroup} from '../controllers/conversationController.js'
const conversationRouter = Router();
conversationRouter.route("/home").get(verifyToken,getConversations)
conversationRouter.route("/create").post(verifyToken, createConversation);
conversationRouter.route("/:id").delete(verifyToken, deleteConversation);
conversationRouter.route("/create-group").post(verifyToken, createGroupConv);
conversationRouter.route("/:id").put(verifyToken, updateGroupConv);
conversationRouter.route("/:id/leave").post(verifyToken, leaveGroup);
export default conversationRouter