import { Router } from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  getUsersViaSearch
} from "../controllers/authController.js"
import { verifyToken } from "../middlewares/authMiddleware.js"
const userRouter = Router();
/**
 * @swagger
 * /api/auth/signUp:
 *   post:
 *     summary: Sign up
 *     tags: [Auth]
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jitu
 *               lastName:
 *                 type: string
 *                 example: Pal
 *               nickName:
 *                 type: string
 *               profilePic:
 *                 type: string
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: User signed up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User signed up successfully
 *                 userId:
 *                   type: number
 *                   example: 1
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 *       500:
 *         description: An error occurred while signing up
 */
userRouter.route("/signUp").post(signup)
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     description: Authenticate user and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jitu77
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Credentials required !!
 *       500:
 *         description: User not found!!
 */
userRouter.route("/login").post(login)
/**
 * @swagger
 * /api/auth/refreshToken:
 *   post:
 *     summary: Refresh token
 *     tags: [Auth]
 *     description: Refresh the access token using the refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzc0MTE5Njg0LCJleHAiOjE3NzQxMjA1ODR9.R6ip-1Ro5sKbrBKtNqtDD37_Z_wvBXeiY5PAYRcoO_0
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully!!
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzc0MTE5Njg0LCJleHAiOjE3NzQxMjA1ODR9.R6ip-1Ro5sKbrBKtNqtDD37_Z_wvBXeiY5PAYRcoO_0
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: An error occurred while refreshing the token
 */
userRouter.route("/refreshToken").post(verifyToken,refreshToken)
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     description: Logout the user and clear the access and refresh tokens
 *     responses:
 *       201:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful!!
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: An error occurred while logging out
 */
userRouter.route("/logout").post(logout)
userRouter.route("/user").get(verifyToken,getUsersViaSearch)
export default userRouter