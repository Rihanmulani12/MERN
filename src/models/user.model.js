import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema({

    username : {
        type : String,
        required : true,
        unique : true,
        lowecase : true,
        trim : true,
        index : true
    },

    email : {
        type : String,
        required : true,
        unique : true,
        lowecase : true,
        trim : true,
       
    },

    fullname : {
        type : String,
        required : true,
        index : true,
        trim : true,
       
    },

    avatar : {
        type : String, //cloud url
        required : true,
        
    },
    coverImage : {
        type : String,
    },

    watchHistory : {
        type : Schema.Types.ObjectId,
        ref : "video"
    },

    password : {
        type : String,
        required : [true , "password is requried"]

    },
    refreshToken : {
        type : String
    }
    
  



    
},{timestamps : true})

userSchema.pre("save" , async function (next) {
  if(!this.isModified("password")) return next();
    this.password =  await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw new Error(error);
    }
  };

userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
       {
        _id : this._id,
        email : this.email,
        username : this.username,
        fullname : this.fullname
       },
       process.env.ACCES_TOKEN_SECRET,
       {
        expiresIn : process.env.ACCES_TOKEN_EXPIRY
       }

    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
       {
        _id : this._id,
        
       },
       process.env.REFRESH_TOKEN_SECRET,
       {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
       }

    )
}


export const User = mongoose.model('User' , userSchema)