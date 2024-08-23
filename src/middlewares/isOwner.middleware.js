import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utiles/asyncHandler.js";
import { apiError } from "../utiles/ApiError.js";


const isOwner = asyncHandler(async(req,res,next)=>{

   try {
     /**steps
      * recieve user and tweetId
      * find tweet by tweet and populate {postedBy}
      * compare the loggedin user and postedBy user
      * if both are same mark isOwner = true else false
      * call next
      */
 
     const tweetId = req.params.ObjectId
     const user = req.user
 
     if(!tweetId){
        throw new apiError(400, "tweet id is required")
     }
     const tweet = await Tweet.findById(tweetId).populate().select("postedBy")
     
 
     const owner= await user._id.equals(tweet.postedBy._id)
 
     
 
     if(!owner){
         var isOwner=false
         throw new apiError(400, "this functionality is only for post owner",
            )
         
     }else{
         var isOwner = true
     }
 
     req.user= isOwner
 
     next()
 
   } catch (error) {
    
    throw new apiError(500, "error in verifying owner of post",
        console.log(error)
    )

   }
    

})

export{isOwner}