import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
export const  verifyjwt = asyncHandler(async(req, res, next)=>{
 try {
     const token =  req.cookies?.accessToken || req.header("Authorization")?.repalce("Bearer", "")
   
       if(!token){
           throw new ApiError(401 , "Unauthorizred User Request")
       }
   
       const decodeToken =  jwt.verify(token, process.env.ACCES_TOKEN_SECRET)
       const user = await User.findById(decodeToken?._id).select(
       "-password -refreshToken")
   
   
       if(!user){
           throw ApiError(401, "invlaid Access Token")
       }
   
       req.user = user;
       next()
 } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access Token")
 }

})

export default verifyjwt