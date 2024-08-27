import {asyncHandler} from "../utiles/asyncHandler.js"
import{apiError} from "../utiles/ApiError.js"
import {apiResponse} from "../utiles/apiResponse.js"
import{createHashtag,bulkCreateHashtags,findByName} from "./hashtag.controller.js"
import {Tweet} from "../models/tweet.model.js"
import mongoose from "mongoose"
import {Views} from "../models/views.model.js"


const createTweet = asyncHandler(async(req,res)=>{

    // check user is login and find user
    // fetch the data for tweet
   // check if the details is recieved
    // create the tweet
    // extract the hashtags from content
    // find which hashtags is present in database
    // which  hashtags not present create 
    // push the tweet in tweets array of hashtags
    // send response to frontend


   try {
     const user = req.user
     const {content,imageUrl} = req.body

    
 
     if(!content){
         throw new apiError(400,"tweet content is required")
 
 
     }
   
     
     // create tweet
 
     const tweet = await Tweet.create({
         content:content,
         postedBy:user._id,
         imageUrl
     })
     user.posts.push(tweet._id)
     await user.save()
 
     // extract hashtags 

     const manageHashtags = async(content)=>{

        
        try {
            
            let tags = content.match(/#[0-9a-zA-Z_]+/g) // regex for matching hashtags
            if(!tags){
                var  msg="no tags are available in tweet"
                return msg
            }
            
            
            const extractedTags = tags.map((tag)=>tag.substring(1));
            console.log( "extracte tags =>",extractedTags)
        
            const alreadyPresentTags = await findByName(extractedTags)
           const presentTangTitle = alreadyPresentTags.map(tags=>tags.title)
            
            
            const newTags = extractedTags.filter((tag)=>
            !presentTangTitle.includes(tag)).map(tag => {
               return {
                   title:tag,
                   tweets:[tweet._id]
               }
   
           
               
            })
            
            
           
            
           
            
            const hashTags = await bulkCreateHashtags(newTags)                       
            
            
            alreadyPresentTags.forEach((tag)=>{
                tag.tweets.push(tweet._id)
                 tag.save()
                 
            return hashTags

            })
            
        } catch (error) {
            throw new apiError(500,"error in extracting hashtags",
                console.log(error)
            )
        };
     }
    
      await manageHashtags(content)
     
    
    return res.status(200).json(
     new apiResponse(200,
         {
             tweet,
             
             
         },
         "tweet created successfully"
     )
 )
   } catch (error) {

    throw new apiError(500,"error in creating tweet",
        console.log(error)
    )
    
   }
   
})

const deleteTweet = asyncHandler(async(req,res)=>{

    const user = req.user
    const tweetId = req.params.ObjectId
    console.log("tweet id =>",tweetId)

    if(!tweetId){
        throw new apiError(400, "tweet ID is missing")
    }
 
    // delete the tweet

    await Tweet.findByIdAndDelete(tweetId)

    // remove from the user array
    
    user.posts.pull(tweetId)
    await user.save()

    // todo: remove the deleted tweet from the hashtags array

  


   
    res.status(200).json(
        new apiResponse(
            200,
            {},
            "tweet deleted successfully"
        )
    )
})



// methode for fetching tweet

const fetchTweet = asyncHandler(async(req,res)=>{

   try {
     /** steps:
      * use aggrigation pipelines for this
      * match the tweet 
      * lookup the tweet model to like model and find the likes and like count
      * aply above algo with comment also 
      * show view,like and comment  count on post 
      * 
      */
     const tweetId= req.query.tweetId
     console.log(tweetId)
        const user= req.user
        const userId=user._id
   

       
    const tweet = await Tweet.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(`${tweetId}`)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"likes",
                foreignField:"_id",
                as:"likes"
            }
        },
        // console.log("first lookup"),
       {
        $lookup:{
            from:"comments",
            localField:"comments",
            foreignField:"_id",
            as:"comments"
        }
       },
        // console.log("second lookup"),
        {
            $lookup:{
                from:"views",
                localField:"views",
                foreignField:"_id",
                as:"views"
            }
        },
        // console.log("third lookup"),
        {
            $lookup:{
                from:"users",
                localField:"postedBy",
                foreignField:"_id",
                as:"postedBy",
                pipeline:[
                    {
                        $project:{
                            _id:0,
                            username:1,
                            fullName:1,
                            avtar:1
                        }
                    }
                ]
            },
            
        },
        // console.log("forth lookup"),
        {
            $addFields:{

                likeCount:{
                    $size:"$likes"
                },
                commentCount:{
                    $size:"$comments"
                },
                viewCount:{
                    $size:"$views"
                },
                postedBy:{
                    $first:"$postedBy"
                },
            }
        },
        // console.log("fields added"),
        {
            $project:{
                content:1,
                imageUrl:1,
                likeCount:1,
                commentCount:1,
                viewCount:1,
                postedBy:1
            }
        },
        // console.log("final"),
       

    ])

        // create view obj and push it on views array of post

      
       
        const existView = await Views.findOne({
            post:tweetId,
            viewedBy:userId
        })
       
 
    if(!existView) {
        var view = await Views.create({
            post: tweetId,
            viewedBy:userId
        
        })
        }

         const viewedTweet=   await Tweet.findById(tweetId).populate().select("views")
        if(view){
            viewedTweet.views.push(view)
            await viewedTweet.save()
        }
      
    

     if(!tweet.length){
        throw new apiError(400,
            "tweet does not exists"
        )
     }

     res.status(200).json(
        new apiResponse(200,
            tweet[0],
            "tweet fetched successfully"
        )
     )
   } catch (error) {
    throw new apiError(500,
        "error in fetching tweet",
        console.log(error)
    )
   }
})

export{createTweet,deleteTweet,fetchTweet}