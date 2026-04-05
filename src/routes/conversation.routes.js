import { Router } from "express";
import { verifyToken } from  "../middlewares/authMiddleware.js"
import {getConversations,createConversation,
        deleteConversation,createGroupConv,updateGroupConv,
        leaveGroup,getConversationsById} from '../controllers/conversationController.js'
const conversationRouter = Router();
/**
 * @swagger
 * /api/conversations/home:
 *   get:
 *     summary: Get conversations
 *     tags: [Conversations]
 *     description: Fetch the list of conversations for the authenticated user
 *     responses:
 *       200:
 *         description: Conversations fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       conversationId:
 *                         type: number
 *                       name:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *                       lastMessage:
 *                         type: string
 *                       lastMessageTime:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: An error occurred while fetching conversations
 */
conversationRouter.route("/home").get(verifyToken,getConversations)
/**
 * @swagger
 * /api/conversations/create:
 *   post:
 *     summary: Create a conversation
 *     tags: [Conversations]
 *     description: Create a new conversation between the authenticated user and another user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otherUserId:
 *                 type: number
 *                 example: 2
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversationId:
 *                       type: number
 *                     otherUserId:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: An error occurred while creating the conversation
 */
conversationRouter.route("/create").post(verifyToken, createConversation);
/**
 * @swagger
 * /api/conversations/{id}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [Conversations]
 *     description: Delete a conversation by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the conversation
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Conversation deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: An error occurred while deleting the conversation
 */
conversationRouter.route("/:id").delete(verifyToken, deleteConversation);
/**
 * @swagger
 * /api/conversations/create-group:
 *   post:
 *     summary: Create a group conversation
 *     tags: [Conversations]
 *     description: Create a new group conversation with the authenticated user and other users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [1, 2, 3]
 *               name:
 *                 type: string
 *                 example: My Group
 *     responses:
 *       201:
 *         description: Group conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversationId:
 *                       type: number
 *                     name:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Group must have at least 3 users
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: An error occurred while creating the group conversation
 */
conversationRouter.route("/create-group").post(verifyToken, createGroupConv);
/**
 * @swagger
 * /api/conversations/{id}:
 *   put:
 *     summary: Update a group conversation
 *     tags: [Conversations]
 *     description: Update a group conversation by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the conversation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Group
 *               profilePic:
 *                 type: string
 *               addUserIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [1, 2, 3]
 *               removeUserIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [4, 5, 6]
 *     responses:
 *       200:
 *         description: Group conversation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversationId:
 *                       type: number
 *                     name:
 *                       type: string
 *                     profilePic:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: An error occurred while updating the group conversation
 */
conversationRouter.route("/:id").put(verifyToken, updateGroupConv);
/**
 * @swagger
 * /api/conversations/{id}/leave:
 *   post:
 *     summary: Leave a group conversation
 *     tags: [Conversations]
 *     description: Leave a group conversation by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the conversation
 *     responses:
 *       200:
 *         description: Group conversation left successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Left group
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: An error occurred while leaving the group conversation
 */
conversationRouter.route("/:id/leave").post(verifyToken, leaveGroup);

conversationRouter.route("/:id").get(verifyToken, getConversationsById);
export default conversationRouter