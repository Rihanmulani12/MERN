import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


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

const loginUser = asyncHandler(async(req, res) =>{
    // req body -> data
    // username or email
    // find the user
    // password check
    //access and refresh token
    // send cookies
 
    const {email , username, password} = req.body

    if(!username || !email){
       throw new ApiError(400 , "usrename or password is required")
    }

   const user = await User.findOne({
      $or : [{username} , {email}]
   })

   if(!user){
      throw new ApiError(404, "user not exists")
   }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
      throw new ApiError(401, "user invalid credentials")
   }

   const {accessToken , refreshToken} = await generateAccessAndRefereshTokens(user._id)
    
   const loggedInuser = User.findById(user._id).select(
      "-password -refreshToken"
   )

   const options = {
      httpOnly : true,
      secure : true
   }

   return res.
   status(200)
   .cookie("accessToken" , accessToken , options)
   .cookie("refreshToken" , refreshToken , options)
   .json (
      new ApiResponse(
         200,
         {
           user : loggedInuser , accessToken , refreshToken 
         },

         "User logged in succesfully"
      )
   )

})

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

export { registerUser, loginUser , logoutUser } 