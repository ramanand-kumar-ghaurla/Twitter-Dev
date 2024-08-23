import { Views } from "../models/views.model.js";

import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utiles/asyncHandler.js";
import { apiResponse } from "../utiles/apiResponse.js";
import { apiError } from "../utiles/ApiError.js";

const getViews = asyncHandler(async(req,res)=>{

  try {
      /**steps
       * extract user and tweetId from url
       * find views on the basis of tweetid
       * populate postedby by username
       */
  
      
      const tweetId = req.params.ObjectId
  
     
      const views = await Views.find({
          post:tweetId
      }).populate({
        path:"viewedBy",
        select:{
            username:1,
            _id:0,
            
            }
      }).select("-_id -post")
  
      
      return res.status(200).json(
        new apiResponse(200,
            views,
            "tweet views fetched successfully"
        )
      )
  
  } catch (error) {
    throw new apiError(500,"error in fatching tweet views",
        console.log(error)
    )
  }

})

export {getViews}