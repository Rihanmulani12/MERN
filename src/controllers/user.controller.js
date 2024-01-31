import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import  jwt from "jsonwebtoken"


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
     const user =  await User.findById(userId)
     const accessToken = user.generateAccessToken();
     const refreshToken =  user.generateRefreshToken();

     user.refreshToken = refreshToken
     await user.save({ValidateBeforeSave : false})
     return {accessToken , refreshToken}


    } catch (error) {
      throw new ApiError(500 , "something wrong while gen tokens")
    }
}

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
   //console.log("email:" , email );

    if(
       [fullname , email , username , password].some((field) =>{
        field?.trim()===""
       })
    ){
       throw new ApiError(400, "all fileds are requried")
    }
   
   const existedUser = await User.findOne({
        $or : [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409 , "user with email or username")
    }

    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path ?? null;


   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
       coverImageLocalPath = req.files.coverImage[0].path
   }
   
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

const loginUser = asyncHandler(async (req, res) => {
   const { email, username, password } = req.body;
 
   if (!username && !email) {
     throw new ApiError(400, "username or email is required");
   }
 
   const user = await User.findOne({
     $or: [{ username }, { email }],
   });
 
   if (!user) {
     throw new ApiError(404, "user not exists");
   }
 
   const isPasswordValid = await user.isPasswordCorrect(password);
 
   if (!isPasswordValid) {
     throw new ApiError(401, "invalid credentials");
   }
 
   const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
 
   // Retrieve the user using findById and select only necessary fields
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
 
   if (!loggedInUser) {
     throw new ApiError(500, "Failed to retrieve user after login");
   }
 
   const options = {
     httpOnly: true,
     secure: true,
   };
 
   return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
       new ApiResponse(200, {
         user: loggedInUser,
         accessToken,
         refreshToken,
       }, "User logged in successfully")
     );
 });
 

const logoutUser = asyncHandler(async(req, res)=>{
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set : {
            refreshToken : undefined
         }
      },
      {
         new : true
      }
   )

   const options = {
      httpOnly : true,
      secure : true
   }

   return res.status(200)
   .clearCookie("accessToken" , options)
   .clearCookie("refreshToken" , options)
   .json(new ApiResponse(200 , {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
      throw new ApiError(401 , "unauthorized request")
    }

    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken , 
        process.env.REFRESH_TOKEN_SECRET
      )
  
     const user = await User.findById(decodedToken?._id)
  
     if(!user){
        throw new ApiError(401, "Invalid Refresh Token")
     }
  
     if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401 , "Refresh Token is expried or used")
     }
  
     const options = {
        httpOnly :  true,
        secure : true
     }
     
     const {accessToken , newRefreshToken} =  await generateAccessAndRefereshTokens(user._id)
      
     return res
     .status(200)
     .cookie("accessToken" , accessToken , options)
     .cookie("refreshToken" , newRefreshToken, options)
     .json(
         new ApiResponse(
           200, {
              accessToken, refreshToken : newRefreshToken
           },
           "acces token refreshed"
         )
     )
  
   }catch (error) {
      throw new ApiError(401 , error?.message ||
         "Invalid Refresh Tokens")
   }
})

export { registerUser, loginUser , logoutUser , refreshAccessToken } 