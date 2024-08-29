import {asyncHandler} from "../utiles/asyncHandler.js"
import{apiError} from "../utiles/ApiError.js"
import {apiResponse} from "../utiles/apiResponse.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import{User} from "../models/user.model.js"
import mongoose from "mongoose"

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
    
            if(!modelToComment){
                throw new apiError(404,
                    `no ${modelType} is available corresponding to this mdoel ID`
                )
            }
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

const getCommentsOfTweet = asyncHandler(async(req,res)=>{
    try {
        /**
         * fetch the details
         * aggregate the tweet and comment model
         * aply sub pipeline on comment model
         * add like count ,nested comment count and auther 
         * 
         */

        const user= req.user
        const tweetId= req.query.tweetId
        console.log(tweetId)

        if(!tweetId){
            throw new apiError(400,"tweet id is mendtory")
        }

        const commentsOfTweets = await Tweet.aggregate([
            {
                $match:{
                    _id: new mongoose.Types.ObjectId(`${tweetId}`),
                    
                },
                
            },
            {
                $project:{
                    comments:1,
                    _id:0
                }
            },
            

            {
                $lookup:{
            from:"comments",
            localField:"comments",
            foreignField:"_id",
            as:"comments",
            pipeline:[
               
                {
                    $lookup:{
                        from:"users",
                        localField:"commentedBy",
                        foreignField:"_id",
                        as:"commentedBy",
                        pipeline:[
                            {
                                $project:{
                                    _id:0,
                                    username:1,
                                    fullName:1,
                                    
                                        }
                            }
                        ]
                    }
                },
                {
                    $lookup:{
                        from:"comments",
                        localField:"comments",
                        foreignField:"_id",
                        as:"replies",

                    }
                },
                {
                    $addFields:{
                        likeCount:{
                            $size:"$likes"
                                 },

                            replyCount:{
                                $size:"$replies"
                            },
                            commentedBy:{
                                $first:"$commentedBy"
                            }
                    }
                },
                {
                    $project:{
                        content:1,
                        commentedBy:1,
                        likeCount:1,
                        replyCount:1
                    }
                }
                    
                    ]
                    
                }
            },
           
        ])
        if(!commentsOfTweets.length){
            throw new apiError(404, "no tweet")
        }

        
            res.status(200).json(
                new apiResponse(200,
                    commentsOfTweets[0],
                    "all comments of tweet is fetched successfully"
                )
             )
        

        



    } catch (error) {
      
        throw new apiError(500, "error in getting comments of tweet",
            console.log(error)
        )
    }
})

const getCommentOfComment = asyncHandler(async(req,res)=>{

    try {
        const commentId= req.query.commentId
            console.log(commentId)
    
            const commentsOfComment = await Comment.aggregate([
                {
                    $match:{
                        _id: new mongoose.Types.ObjectId(`${commentId}`),
                        
                    },
                    
                },
                {
                    $project:{
                        content:1,
                        comments:1,
                        _id:0
                    }
                },
                
    
                {
                    $lookup:{
                        from:"comments",
                        localField:"comments",
                        foreignField:"_id",
                        as:"comments",
                        pipeline:[
                   
                    {
                        $lookup:{
                            from:"users",
                            localField:"commentedBy",
                            foreignField:"_id",
                            as:"commentedBy",
                            pipeline:[
                                {
                                    $project:{
                                        _id:0,
                                        username:1,
                                        fullName:1,
                                        
                                            }
                                }
                            ]
                        }
                    },
                    {
                        $lookup:{
                            from:"comments",
                            localField:"comments",
                            foreignField:"_id",
                            as:"replies",
    
                        }
                    },
                    {
                        $addFields:{
                            likeCount:{
                                $size:"$likes"
                                     },
    
                                replyCount:{
                                    $size:"$replies"
                                },
                                commentedBy:{
                                    $first:"$commentedBy"
                                }
                        }
                    },
                    {
                        $project:{
                            content:1,
                            commentedBy:1,
                            likeCount:1,
                            replyCount:1
                        }
                    }
                        
                        ]
                        
                    }
                },
               
            ])
            console.log(commentsOfComment)
            if(!commentsOfComment.length){
                throw new apiError(404, "no comment available corressponding to this commentId")
            }
    
            
                res.status(200).json(
                    new apiResponse(200,
                        commentsOfComment[0],
                        "all replies of comment is fetched successfully"
                    )
                 )
    } catch (error) {
        throw new apiError(500,"error in fetching replies of comment",
            console.log(error)
        )
    }

})

export{createComment,getCommentsOfTweet,getCommentOfComment}
