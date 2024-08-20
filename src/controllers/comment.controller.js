import {asyncHandler} from "../utiles/asyncHandler.js"
import{apiError} from "../utiles/ApiError.js"
import {apiResponse} from "../utiles/apiResponse.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"

const findModel = async (modelType,modelId)=>{
    if(!modelType && !modelId){
        throw new apiError(400,"model type and model id is required")
    }

    if (modelType === "Tweet") {
         var commentedModel = await Tweet.findById(modelId).populate({ path:"comments"})
        
    }else if(modelType ==="Comment"){
        var commentedModel = await Comment.findById(modelId).populate({ path:"comments"})
    }
     else {
        throw new apiError(400, "unknown model type")
    }

    return commentedModel
}


const createComment = asyncHandler(async(req,res)=>{
try {
    
        /**
             * step
             * 1. fetch the details
             * 2. choose the model to comment on the basis of model type and model ID
             * 3. define the commented model by conditioning 
             * 6. create the comment[it should be done erytime] and push it in the array of model type
             * 5. return the response
             */
    
            // step 1
    
            const {content} = req.body
            const user = req.user
            const modelType  = req.query.modelType
            const modelId = req.query.modelId
    
            if(!content){
                throw new apiError(400, "comment body is required")
            }
    
            // step 2
            const modelToComment= await findModel(modelType,modelId)
    
            console.log(modelType)
            console.log("model to comment =>",modelToComment)
    
            // create comment
    
            const comment = await Comment.create({
                content:content,
                onModel:modelType,
                commentedModel:modelId,
                commentedBy:user._id,
                comments:[]
            })
            console.log("new comment =>", comment)
    
            // push comment on array
    
            modelToComment.comments.push(comment)
            await modelToComment.save()

            res.status(200).json(
                new apiResponse(200,
                    comment,
                    `user ${user.username} successfully commented on ${modelType}`
                )
            )
    
            
    
} catch (error) {
    throw new apiError(500,
        "error in creating comment",
        console.log(error),
        console.error(error)
    )
    
}
})

export{createComment}
