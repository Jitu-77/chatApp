import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();
// Signup logic
export const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      nickName: data.nickName,
      profilePic: data.profilePic,
      password: hashedPassword,
    },
    select: {
      firstName: true,
      lastName: true,
      nickName: true,
      profilePic: true,
    },
  });
  // let {password,...rest} = user
  return user;
};

export const generateToken = (user) => {
  console.log("generateToken USER ", user);
  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );

  return { accessToken, refreshToken };
};

export const loginUser = async (firstName, _password) => {
  const user = await prisma.user.findFirst({
    where: { firstName },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      nickName: true,
      profilePic: true,
      password: true,
    },
  });
  if (!user) throw new Error("User not found!!");
  console.log("USER", user);
  const isMatch = await bcrypt.compare(_password, user.password);
  console.log("isMatch", isMatch);
  if (!isMatch) throw new Error("Invalid credentials!!");
  let { password, ...rest } = user;
  return rest;
};
