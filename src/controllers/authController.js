import {createUser,loginUser,generateToken,searchUsers} from '../services/authService.js'
import jwt from "jsonwebtoken"
export const signup = async (req,res)=>{
    try {
        console.log(req.body)
      const user =  await createUser(req.body);
      res.status(201).json({
        message: "User created successfully",
        user});
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export const login = async(req,res)=>{
    const { firstName, password } = req.body;
    if(!firstName || !password){
        res.status(401).json({
        message: "Credentials required !!",
        user});
    }
    if(firstName && password){
        try {
        const user = await loginUser(firstName,password)
            if(user){
                console.log("USER",user)
                  const { accessToken, refreshToken } = 
                  await generateToken(user)
                  console.log(accessToken,refreshToken)
                    res.status(201)
                    // .cookie("accessToken",accessToken)
                    .cookie("refreshToken",refreshToken)
                    .json({
                       message: "Successful login !!",
                       user,
                       accessToken
                    })            
            }else{
                res.status(401).json({
                    message: "Invalid credentials !!",
                    user});
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({ error: error.message })
        }

    }
}

export const refreshToken = (req,res)=>{
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken){
        res
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .status(401).json({
            message: "Refresh token required !!",
            });
    }
    const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    if(!decodedToken.id){
        res
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .status(401).json({
            message: "Refresh token required !!",
            });       
    }
    console.log(decodedToken)
    const accessToken = jwt.sign({ id: decodedToken.id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    })
    res
    .cookie("accessToken",accessToken)
    .status(201).json({
        message: "Token refreshed successfully !!",
        accessToken
    })
}

export const logout =   (req,res)=>{
    res.clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(201).json({
        message: "Logout successful !!",
    })
}
export const getUsersViaSearch = async(req,res)=>{
  try {
    const search = req.query.search?.replace(/"/g, '').trim() || '';
    if(!search){
      return res.status(400).json({success:false,message:"Search word required"});
    }
    const users = await searchUsers(search);
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({success:false,message:"Failed to fetch users"});
  }
}