import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser =  asyncHandler( async (req, res) =>{
    //get user info from frontend
    //validation - not empty
    // check if user already exists 
    // check for images and avatar
    // upload them to cloudinary 
    // create user object = create entery in db
    // remove passowrd and refresh token filed from responce
    // check for user creation
    // return res



   const {fullname , email , username , password} = req.body
   console.log("email:" , email );

    if(
       [fullname , email , username , password].some((field) =>{
        field?.trim()===""
       })
    ){
       throw new ApiError(400, "all fileds are requried")
    }
   
   const existedUser = User.findOne({
        $or : [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409 , "user with email or username")
    }

   const avatarLocalPath = req.files?.avatar[0]?.path;

   const coverImageLocalPath = req.files?.coverImage[0]?.path;
   
   if(!avatarLocalPath){
       throw new ApiError(400, "Avatar file is must")
   }


const avatar =  await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw ApiError(400 , "avatar file is must")
}


 const user = await User.create({
    fullname,
    avatar : avatar.url,
    coverImage : coverImage?.url || "",
    email,
    password,
    username : username.toLowerCase()
})

 const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
 )

 if( !createdUser){
    throw ApiError(500,"regstier user gone wrong")
 }

 return res.status(201).json(
    new ApiResponse(200, createdUser , "User register succesfully!!")
 )


})

export { registerUser } 