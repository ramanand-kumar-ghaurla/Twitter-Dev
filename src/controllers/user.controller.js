import {asyncHandler} from "../utiles/asyncHandler.js"
import{apiError} from "../utiles/ApiError.js"
import {User} from "../models/user.model.js"
import {apiResponse} from "../utiles/apiResponse.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import mongoose from "mongoose";
dotenv.config();
import JsonWebTokenError from "jsonwebtoken/lib/JsonWebTokenError.js";


// function for generating referesh and access token

const generateAccessAndRefereshToken= async (userId)=>{
    try {
      
        const user = await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refereshToken= user.generateRefereshToken()

       
       
        user.refereshToken = refereshToken;
       await user.save({validateBeforeSave:false})
       
        
       
        
        return {accessToken,refereshToken}
        
    } catch (error) {
        throw new apiError(500,
            "error in generating referesh and access token",
            console.log(error)
        )
        
    }
}


const registerUser = asyncHandler( async (req,res)=>{

   try {    
     // find the details from req
 
     const { username,email,fullName,password } = req.body
     
 
     // validation on the all fields
 
     if(!username && !email && !fullName && !password){
       throw  new apiError(
                     400,
                     "all fields are required",
         )
 
     }
 
     // if (
     //     [username,email,fullName,password].some((field)=>{
     //         field === ""
     //     })
     // ){
     //     new apiError(
     //         400,
     //         "all fields are required",
 
     //     )
     // }
 
 
  const existedUser = await User.findOne({
     $or:[{username},{password},]
   
 })
 
 
  if(existedUser){
     throw new apiError(400, "user with this email and username  is already exists")
  }
 
 //  create the user 
 
  const user = await User.create({
     username,
     email,
     fullName,
     password
 })
 
 // check if the user is created or not
 
 const createdUser = await User.findById(user._id).select(
     "-password -refereshToken"
 )
 
 if (!createdUser){
     throw new apiError(500, "error in registring user")
 }
 
 return res.status(201).json(
     new apiResponse(
         200,
         createdUser,
         "User created successfully",
     )
 )
 
 
 
   } catch (error) {
    throw new apiError(
        500,
        "error in registring user",
        console.log(error)
    )
    
   }
})



// method for login user

const loginUser = asyncHandler(async(req,res)=>{

// fetch data from reqest body
const {username,email,password} = req.body

// validation

if(!(username || email)){
    throw new apiError(400,"username or email is requires")

}

 const user = await User.findOne({
    $or:[{username},{email}]
 })


 if(!user){
    throw new apiError(400,"User does not exists")


}
// check the password

const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid){
    throw new apiError(400,"Password is incorrect")

}

// generate access and referesh token to te user

 const {accessToken,refereshToken}=await generateAccessAndRefereshToken(user._id)

 const loggedInUser = await User.findById(user._id).select("-password -refereshToken")


 const options={
    httpOnly:true,
    secure:true

 }
 return res.status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refereshToken",refereshToken,options)
 .json(
    new apiResponse(
        200,
        {
            user:loggedInUser,refereshToken,accessToken
        },
        "user logged in successfully"
    )
 )
})
// mrthod for logout the user

const logoutUser = asyncHandler(async(req,res)=>{
    try {
       
        await User.findByIdAndUpdate(req.user._id,
            {
                $unset:{refereshToken:1}
            },
            {
                new:true
            }
        )

        const options = {
            httpOnly:true,
            secure:true,
        }
        res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refereshToken",options)
        .json(
            {
                success:true,
                messase:"User logged out successfully "
            }
        )
        
        
    } catch (error) {
        throw new apiError(
            500,
            "error in loging out user",error,
            console.error(error)
        )
        
    }
})


// method for refereh the access token after expireation

const refereshAccessToken = asyncHandler(async(req,res)=>{
    try {
        const incomingRefereshToken = req.cookies.refereshToken || req.body  // problem: req.body creates type problem in jwt
            
        

        // if referesh token is not present 

        if (!incomingRefereshToken) {
           throw new JsonWebTokenError("unauthorized request or token missing")
        }

        // decode the token

        const decodedToken = await jwt.verify(incomingRefereshToken, process.env.REFFERESH_TOKEN_SECRET)
  
        
       
        const user = await User.findById(decodedToken._id)

        if (!user) {
          throw  new apiError(401,"invaid user")
        }

        // if user exist match the token in database

        if (incomingRefereshToken !== user?.refereshToken) {
          throw  new apiError(401,"expird or used referesh token")
        }

        // if token matched assign new tokens

       const {accessToken,refereshToken}= await generateAccessAndRefereshToken(user?._id)

       const options ={
        httpOnly:true,
        secure:true
       }
        
    //    send the reponse to the user

    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refereshToken",refereshToken,options)
    .json({
        success:true,
        data:{
            accessToken,
            refereshToken:refereshToken,
        },
        messase:"New access and referesh tokens generated successfully"

    })
  



} catch (error) {
       
      throw  new apiError(500,
            "error in refreshing the access token",

            console.error(error)
        )
    }
})


// method for updating the password

const changeUserPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;

    const user = await User.findById(req.user._id);
    const isOldPaswordCorrect =await user.isPasswordCorrect(oldPassword
    )

    if(!isOldPaswordCorrect){
        throw new apiError(400, "old password is incorrect")
    }
 
   const oldAndNewPasswordMatched = await bcrypt.compare(newPassword,user.password)

   
    if(oldAndNewPasswordMatched){
        throw new apiError(401,
            "new password and existing password cannot be same"
        )
    }

    user.password = newPassword;
    await user.save({validateBeforeSave:false})

   return res.status(200).json(
        new apiResponse(200,
            {},
            "user password changed successfully"
        )
    )

})

// mothod for changing account details

const updateccountDetails = asyncHandler(async(req,res)=>{

   try {
     const {fullName,username} = req.body
 
     if(!(username || fullName)){
         throw new apiError(400,
             "provide at least full name or username to update "
         )
     }
 
     const user = await User.findByIdAndUpdate(
         req.user._id,
         {
             $set:{ 
                 fullName,
                 username,
             }
                
             
         },
         {new:true },
         
     ).select("-password")

     console.log(user)
     
     return res.status(200).json(
        new apiResponse(200,
            user,
            "user account details updated successfully"
        )
    )
    
   } catch (error) {

    throw new apiError(500,
        "error in updating account details",
        console.error(error)
    )
    
   }
})

// method for get user profile

const getUserProfile = asyncHandler(async(req,res)=>{

    try {
        const {username} = req.params;
    
        if(!username?.trim()){
           throw new apiError(400,"username is missing")
    
        }
    
      const profile = await User.aggregate([
            {
                $match:{
                    username:username?.toLowerCase()
                }
            },
    
            {
                $lookup:{
                    from:"follows",
                    localField:"_id",
                    foreignField:"following",
                    as:"followers",
                }
            },
    
            {
                $lookup:{
                    from:"follows",
                    localField:"_id",
                    foreignField:"follower",
                    as:"followingTo",
                }
            },
    
            {
                $addFields:{
                   

                    followerCount:{
                        $size:"$followers"
                    },
                    followingToCount:{
                        $size: "$followingTo"
                    },
                    isFollowed:{
                        $cond:{
                            if :{
                                $in:[req.user?._id,"$followers.follower"]
                            },
                            then:true,
                            else:false,
                        }
                    }
    
                }
            },
    
            {
                $project:{
                    
                    username:1,
                    fullName:1,
                    posts:1,
                    followerCount:1,
                    followingToCount:1,
                    isFollowed:1,
                    createdAt:1,
                   
    
                }
            }
    
            
    
    
        ]);

        if(!profile?.length){
            throw new apiError(404,"user profile does not exists")
        }
    
        res.status(200).json(
            new apiResponse(200,
                profile[0],
                "user profile feched successfully",
            )
        )

        console.log(profile)
    } catch (error) {
        throw new apiError(500,
            "error in getting user profile",
            console.log(error)
        )
    }


})

const deleteUser = asyncHandler(async(req,res)=>{

    
    try {

        const user = req.user;

    if (!user ) {
        throw new apiError(400,
            "no any user exists"
        )
        
    }

    await User.findByIdAndDelete(user._id)

    res.status(200).json(
        new apiResponse(200,
            {},
            "user account deleted successfully",
        )
    )
        
    } catch (error) {
        throw new apiError(500,
            "error in deleting the user account",
            console.log(error)
        )
        
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refereshAccessToken,
    changeUserPassword,
    updateccountDetails,
    getUserProfile,
    deleteUser
}