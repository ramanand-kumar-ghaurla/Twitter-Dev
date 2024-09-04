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
import { uploadOnCloudinary,deleteImageOnCloudinary } from "../utiles/cloudinary.js";
import fs, { unlink } from "fs"

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


// method for avtar validation



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


     if(req.files && Array.isArray(req.files.avtar) && req.files.avtar.length >0){
        var avtarPath = req.files.avtar[0]?.path
     }
    
    
     if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        var coverImagePath = req.files.coverImage[0]?.path
       
     }
 
    
 
  const existedUser = await User.findOne({
     $or:[{username},{email},]
   
 })


 if(existedUser){
   
    throw new apiError(400, "user with this email and username  is already exists")

 }


 
 
 const getPathAndMediaType = (data)=>{
    const path =  data?.path
    const mimetype = data?.mimetype
    
    
    if(!path && !mimetype){
                throw new apiError(401, "avtar path and media type is required")
            }
           
                const mediaType = ["image/jpj","image/png","image/jpeg"]
                
                // condition for media type
                if(!mediaType.includes(mimetype)){
                    throw new apiError(400, "media type not supported")
                }
             
                // condition for cloudinary folder
                 
                if (data === avtar) {
                   var folderName = "/Twitter-Project/user/avtar"
                } else if(data=== coverImage){
                    var folderName =  "/Twitter-Project/user/cover" 
                }else{
                    return
                }

                // condition for local path

                if(data === coverImage){
                    var coverImageLocalPath = path
                }else if(data === avtar){
                    var avtarLocalPath = path
                }else{
                    return
                }
            
              
                return {avtarLocalPath,coverImageLocalPath, folderName}
                       
    
 }
 
 


 console.log(req.files,"req files")
 let uploadedAvtar

//  if avtar image is available

 if(req.files && Array.isArray(req.files.avtar) && req.files.avtar.length >0){
    var avtar = req.files.avtar[0]
    console.log(avtar,"avtar")
    let {avtarLocalPath,folderName} = getPathAndMediaType(avtar)
    uploadedAvtar = await uploadOnCloudinary(avtarLocalPath,folderName)
    
 }

//  if cover image is availble

let uploadedCoverImage

if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
    var coverImage = req.files.coverImage[0]
    console.log(coverImage,"cover image")
    let {coverImageLocalPath,folderName} = getPathAndMediaType(coverImage)

    uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath,folderName)
    
    
 }

 

    
    
 
 
  
 
 //  create the user 
 
  const user = await User.create({
     username,
     email,
     fullName,
     password,
     avtar:{
        url:uploadedAvtar?.url || "",
        publicId:uploadedAvtar?.public_id || ""                            },
     coverImage:{
        url:uploadedCoverImage?.url ||"",
        publicId:uploadedCoverImage?.public_id || ""                                }
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
    let isAvtar = fs.existsSync(avtarPath)
    let isCover = fs.existsSync(coverImagePath)

    if(isAvtar){
        fs.unlinkSync(avtarPath)

    }

    if(isCover){
        fs.unlinkSync(coverImagePath)
    }



   
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

// method for update user avtar image

const updateUserAvtar = asyncHandler(async(req,res)=>{
   
   try {
     const avtarLocalPath = req.file?.path
     const folderName = "/Twitter-Project/user/avtar"
     const user = req.user
     const publicId = user.avtar?.publicId || ""
    
    
     console.log(publicId, "public id")
    
     if(!avtarLocalPath){
         throw new apiError(401,"please upload a valid avtar file")

     }

     if(publicId){
         await deleteImageOnCloudinary(publicId)
     } 
     
     const updatedAvtar = await uploadOnCloudinary(avtarLocalPath,folderName)
 
   
     const updatedUser = await User.findByIdAndUpdate(
     user._id,
     {
         $set:{
             avtar:{
                 url:updatedAvtar?.url || "",
                 publicId:updatedAvtar?.public_id || ""
             }
         }
     },
     {new :true}
    ).select("-password")
 
    let isAvtar = fs.existsSync(avtarLocalPath)
   

    if(isAvtar){
        fs.unlinkSync(avtarLocalPath)

    }
    
    res.status(200).json(
   
        new apiResponse(200,
            updatedUser,
            "user avtar updated successfully"
        )
       )
 
   } catch (error) {
let avtarLocalPath= req.file?.path
    let isAvtar = fs.existsSync(avtarLocalPath)
   

    if(isAvtar){
        fs.unlinkSync(avtarLocalPath)

    }
    
    throw new apiError(500,"error in updating user avtar",
        console.log(error)
    )
   }
 
})

// UPDATE use cover image

const updateUserCoverImage = asyncHandler(async(req,res)=>{
   
    try {
      const coverImageLocalPath = req.file?.path
      const folderName = "/Twitter-Project/user/cover"
      const user = req.user
      const publicId = user.coverImage?.publicId || ""
     
     
      console.log(publicId, "public id")
     
      if(!coverImageLocalPath){
          throw new apiError(401,"please upload a valid cover image file")
 
      }
 
      if(publicId){
          await deleteImageOnCloudinary(publicId)
      } 
      
      const updatedCoverImage = await uploadOnCloudinary(coverImageLocalPath,folderName)
  
    
      const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
          $set:{
              coverImage:{
                  url:updatedCoverImage?.url || "",
                  publicId:updatedCoverImage?.public_id || ""
              }
          }
      },
      {new :true}
     ).select("-password")
  
     let isCover = fs.existsSync(coverImageLocalPath)
    
 
     if(isCover){
         fs.unlinkSync(coverImageLocalPath)
 
     }
     
     res.status(200).json(
    
         new apiResponse(200,
             updatedUser,
             "user avtar updated successfully"
         )
        )
  
    } catch (error) {
        let coverImageLocalPath = req.file.path
         let isCover = fs.existsSync(coverImageLocalPath)
    
 
     if(isCover){
         fs.unlinkSync(coverImageLocalPath)
 
     }
     
     throw new apiError(500,"error in updating user cover Image",
         console.log(error)
     )
    }
  
 })

// method for get user profile

const getUserProfile = asyncHandler(async(req,res)=>{

    try {
        const {username} = req.params;
        const limit = Number(3)
        const page = Number(req.query.pagen|| 1)
        const skip = (page-1)*limit
    
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
                $lookup:{
                    from:"tweets",
                    localField:"posts",
                    foreignField:"_id",
                    as:"posts",
                    pipeline:[

                        {
                            $sort: {
                              
                              createdAt: -1,
                            }
                          },
                         
                       
                       {
                            $project:{
                                content:1,
                                
                                likes:{$size:"$likes"},
                                comments:{$size:"$comments"},
                                views:{$size:"$views"},
                                createdAt:1,
                               
                                _id:0
                            }
                        }
                    ]
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
                    postCount:{
                        $size:"$posts"
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
                    postCount:1,
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
    updateUserAvtar,
    updateUserCoverImage,
    getUserProfile,
    deleteUser
}