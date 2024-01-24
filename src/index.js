import dotenv from 'dotenv'

import connectDB from "./db/index.js";

dotenv.config({
    path : './env'
})




connectDB();





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