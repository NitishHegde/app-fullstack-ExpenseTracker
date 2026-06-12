import userModel from '../models/userModel.js'
import validator from 'validator';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES;

export default async function authMiddleware(req,res,next){
    // grab the token
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            success: false,
            message: "Unauthorized or token missing"
        });
    }

    const token= authHeader.split(" ")[1];
    try{
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await userModel.findById(payload.id).select("-password");
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;
        next();

    }catch(error){
        console.error("JWT verification Failed: ", error);
        return res.status(401).json({
            success: false,
            message: "Token invalid or expired"
        });
    }
}