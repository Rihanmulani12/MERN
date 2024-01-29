import dotenv from 'dotenv'
import app from './app.js';

import connectDB from "./db/index.js";

dotenv.config({
    path : './env'
})




connectDB().then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`severr is running ${process.env.PORT}`)
    })
}).catch((error) => {
    console.log("mongo db failed" , error);
})
    






// import express from "express";

// const app = express()


// (async ()=> {
//    try {
//       mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//       app.listen(process.env.PORT, ()=>{
//           console.log(`App is listening on this port ${process.env.PORT}`)
//       })


      
    
//    } catch (error){
//     console.error("ERROR :" , error)
//     throw err
//    }
// })()