import jwt from "jsonwebtoken"
import {User} from '../models/user.model.js'
import { asyncHandler } from "../utiles/asyncHandler.js"
import { apiError } from "../utiles/ApiError.js"



const verifyJwt = asyncHandler(async(req,res,next)=>{

  try {
    
     const token= req.cookies?.accessToken || req.header("authorization")?.replace("Bearer","")||req.query.accessToken
  
     
     if(!token){
      throw new apiError(401, "unauthorized request")
     }
  
     const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
     const user = await User.findById(decodedToken?._id).select("-password -refereshToken")
  
     if(!user){
      // todo:disscuss about fronted;
      throw new apiError(401,"invelid access token")
     }
  
     req.user = user;
  
     next()
  } catch (error) {
    console.log(error)
    throw new apiError(401, "error in verifying token",error)
  } 

})

export{verifyJwt}