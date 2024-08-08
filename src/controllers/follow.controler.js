import {Follow} from "../models/follow.schema.js"
import {asyncHandler} from "../utiles/asyncHandler.js"
import{apiError} from "../utiles/ApiError.js"
import {apiResponse} from "../utiles/apiResponse.js"
import {getUserProfile} from "../controllers/user.controller.js"
import {User} from '../models/user.model.js'


const followUser = asyncHandler(async(req,res)=>{

   try {
     /**
      * the username whome account we are going to follow will recieve in the params
      * the username who are follow the particuler user will recieve in req.body
      * 
      */
 
     // fetch the user details
     const upcommingUsername =  req.params
     const currentUser = req.user
     
     const upcommingUser = await User.findOne(upcommingUsername)
     
        

     if(!upcommingUser){
        throw new apiError(400,"user profile missing")
     }


     const followUser = await Follow.create({
            follower: currentUser._id,
            following:upcommingUser._id
     })
        res.status(200).json(
            new apiResponse(200,
                followUser,
                ` The user ${currentUser.username} successsfully followed the user profile of ${upcommingUser.username}`
            )
         )
        

        
     
 
   } catch (error) {

    throw new apiError(500,"error in follow the user",
        console.log(error)
    )
    
   }
   
})

const unfollowUser  = asyncHandler(async(req,res)=>{

    const upcommingUsername = req.params;
    const currentUser = req.user;

    console.log(upcommingUsername)

   

    const upcommingUser = await User.findOne(upcommingUsername)
    if(!upcommingUser ){
        throw new apiError(400,"user profile does not exists")
    }


   const unfollowUser = await Follow.findOneAndDelete({follower:currentUser._id,following:upcommingUser._id})

   res.status(200).json(
    new apiResponse(200,{},
        `The user ${currentUser.username} successfully unfollow the user ${upcommingUser.username}'s profile`
    )
   )
})


export {followUser,unfollowUser}
