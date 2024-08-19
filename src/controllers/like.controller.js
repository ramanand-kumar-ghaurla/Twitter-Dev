import {asyncHandler} from "../utiles/asyncHandler.js"
import{apiError} from "../utiles/ApiError.js"
import {apiResponse} from "../utiles/apiResponse.js"
import {Like} from "../models/like.model.js"
import {Tweet} from "../models/tweet.model.js"

const findModel = async (modelType,modelId)=>{
    if(!modelType && !modelId){
        throw new apiError(400,"model type and model id is required")
    }

    if (modelType === "Tweet") {
         var likedToModel = await Tweet.findById(modelId).populate({ path:"likes"})
        
    }else if(modelType ==="Comment"){
       // var likedToModel = await Comment.findById(modelId)
    }
     else {
        throw new apiError(400, "unknown model type")
    }

    return likedToModel
}

const toggleLike = asyncHandler(async(req,res)=>{
    try {

        /**
         * step
         * 1. fetch the details
         * 2. choose the model to like on the basis of model type and model ID
         * 3. define the liked to model by conditioning 
         * 4. check if the like on corresponding model by loggedin user
         * 5. on the basis of condition toggle the like
         * 6. return the response
         */
        const user = req.user
        const modelType  = req.query.modelType
        const modelId = req.query.modelId
        console.log(modelId,modelType)

        // step 2 

        const modelToLike= await findModel(modelType,modelId)

        console.log("model to like =>",modelToLike)
        // step 3

        const existLike = await Like.findOne({
            onModel: modelType,
            likedToModel: modelId,
            likedBy:user._id
        })

        console.log("exist =>",existLike)
        // step 4 and 5

        if (existLike) {
            
            modelToLike.likes.pull(existLike._id)
            await modelToLike.save()

            await existLike.deleteOne(existLike._id)

            var isLiked = false
        } else {

            var newLike = await Like.create({
                onModel :modelType,
                likedToModel:modelId,
                likedBy:user._id
            })

            console.log("new like :",newLike)
            
            modelToLike.likes.push(newLike._id)
            await modelToLike.save()

            var isLiked= true
        }

        // step 6 => if is liked :true retun new like obj else simple msg

        if (isLiked === true) {
            var response= res.status(200).json(
                new apiResponse(200,
                    newLike,
                    `the user ${user.username} successfully liked the ${modelType}`
                )
            )
        } else {
            
            var response= res.status(200).json(
                new apiResponse(200,
                    {},
                    `the user ${user.username} successfully unliked the ${modelType}`
                )
            )
        }

        return res.status(200).json(
            {data:response}
        )





    } catch (error) {
        throw new apiError(500,"error in toggeling like",
            console.log(error)
        )
    }

})

export {toggleLike}