import {Follow} from "../models/follow.schema.js"
import {asyncHandler} from "../utiles/asyncHandler.js"
import{apiError} from "../utiles/ApiError.js"
import {apiResponse} from "../utiles/apiResponse.js"

import {User} from '../models/user.model.js'


const togglefollow = asyncHandler(async(req,res)=>{

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
     if(!upcommingUser ){
        throw new apiError(400,"user profile does not exists")
    }

   
    let followStatus
     const isFollowed = await Follow.findOne({follower:currentUser._id,following:upcommingUser._id})
     if(isFollowed){
        var unfollowUser = await Follow.findOneAndDelete({follower:currentUser._id,following:upcommingUser._id})
         followStatus=false

     }else{
        var followedUser = await Follow.create({
            follower: currentUser._id,
            following:upcommingUser._id
           
     })
    
           followStatus=true
     }
        
     if(unfollowUser){
        return  res.status(200).json(
            new apiResponse(200,
                {unfollowUser,
                    followStatus
                },
                ` The user ${currentUser.username} successsfully unfollow the user profile of ${upcommingUser.username}`
            )
         )
     }else{
        return  res.status(200).json(
            new apiResponse(200,
               { followedUser,
                followStatus
               },
               
                ` The user ${currentUser.username} successsfully followed the user profile of ${upcommingUser.username}`
            )
         )
     }
        

        
     
 
   } catch (error) {

    throw new apiError(500,"error in toggling follow the user",
        console.log(error)
    )
    
   }
   
})




const getFollower = asyncHandler(async(req,res)=>{
   try {
     // fetch the details
 
   const  upcommingUsername = req.params
    
 
     if(!upcommingUsername){
         throw new apiError(400,"user details missing")
     }
 
    const  upcommingUser = await User.findOne(upcommingUsername)

    if(!upcommingUser){
        throw new apiError(400,"user profile does not exists")
    }
 
    const userFollowers = await Follow.find({
     following:upcommingUser._id,
    }).populate('follower', {
        username:1,
        fullName:1,
        avtar:1
    } ).select('follower')

      

   
   return res.status(200).json(
     new apiResponse(200,
        userFollowers,
         "User follower fetched successfully",
     )
    )
   } catch (error) {
    throw new apiError(500,
        "error in getting the user followers",
        console.log(error)
    )
   }
})


const getFollowing = asyncHandler(async(req,res)=>{
    try {
      // fetch the details
  
    const  upcommingUsername = req.params
     
  
      if(!upcommingUsername){
          throw new apiError(400,"user details missing")
      }
  
     const  upcommingUser = await User.findOne(upcommingUsername)

     if(!upcommingUser){
        throw new apiError(400,"user profile does not exists")
    }
  
     const userFollowers = await Follow.find({
      follower:upcommingUser._id,
    }).populate('following', {
        username:1,
        fullName:1,
        avtar:1
    } ).select('following')

    return res.status(200).json(
      new apiResponse(200,
          userFollowers,
          "User following fetched successfully",
      )
     )
    } catch (error) {
     throw new apiError(500,
         "error in getting the user following",
         console.log(error)
     )
    }
 })

export {togglefollow,getFollower,getFollowing}
