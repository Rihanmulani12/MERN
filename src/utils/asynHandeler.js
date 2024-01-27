const asyncHandler = (reqHandler) => {
   (req, res, next) =>{
    Promise.resolve(reqHandler(req, res,next)).catch((err) => next(err))
   }
}

export default asyncHandler;

// const asyncHandler = (fn) => async(req, res, next) => {
//     try {
        
//     } catch (error) {
//         res.status(err.code || 500 ).json({
//             success : false,
//             message : error.message
//         })
//     }
// }