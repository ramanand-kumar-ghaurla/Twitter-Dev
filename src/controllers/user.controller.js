import {asyncHandler} from "../utiles/asyncHandler.js"
import{apiError} from "../utiles/ApiError.js"
import {User} from "../models/user.model.js"
import {apiResponse} from "../utiles/apiResponse.js"



const registerUser = asyncHandler( async (req,res)=>{

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



})

export {registerUser}