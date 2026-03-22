import { Router } from "express";
import { verifyToken } from  "../middlewares/authMiddleware.js"
import {getConversations} from '../controllers/conversationController.js'
const conversationRouter = Router();
conversationRouter.route("/home").post(verifyToken,getConversations)
export default conversationRouter