import {asyncHandler} from "../utiles/asyncHandler.js"
import{apiError} from "../utiles/ApiError.js"
import {User} from "../models/user.model.js"
import {apiResponse} from "../utiles/apiResponse.js"
import bcrypt from "bcrypt";


// function for generating referesh and access token

const generateAccessAndRefereshToken= async (userId)=>{
    try {

        const user = await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refereshToken= user.generateRefereshToken()

        user.refereshToken = refereshToken
        user.save({validateBeforeSave:false})

        return {accessToken,refereshToken}
        
    } catch (error) {
        throw new apiError(500,
            "error in generating referesh and access token"
        )
        
    }
}


const registerUser = asyncHandler( async (req,res)=>{

   try {
     // find the details from req
 
     const { username,email,fullName,password } = req.body
     
 
     // validation on the all fields
 
     if(!username && !email && !fullName && !password){
         new apiError(
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
     $or:[{username},{password}]
   
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


export {registerUser ,loginUser}