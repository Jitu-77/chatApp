import jwt from "jsonwebtoken"

export const verifyToken = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if(!authHeader){
        return res
        .status(401)
        .json({
            error :"Access token required."
        })
    } 
    const token = authHeader.split(" ")[1];
    if(!token){
        return res
        .status(401)
        .json({
            error :"Access token required."
        })
    }
    try {
    const decodedToken = jwt.verify(token,process.env.JWT_ACCESS_SECRET);
    if(!decodedToken.id){
        return res
        .status(401)
        .json({
            error :"Access token required."
        })
    }
    console.log(token)
    console.log(decodedToken);
    req.user = decodedToken;
    next();        
    } catch (error) {
     return res.status(403).json({
      error: "Invalid or expired token",
    });       
    }    

}