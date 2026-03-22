import { Router } from "express";
import {
  signup,
  login,
  refreshToken,
  logout
} from "../controllers/authController.js"
import { verifyToken } from "../middlewares/authMiddleware.js"
const userRouter = Router();

userRouter.route("/signUp").post(signup)
userRouter.route("/login").post(login)
userRouter.route("/refreshToken").post(verifyToken,refreshToken)
userRouter.route("/logout").post(logout)
export default userRouter