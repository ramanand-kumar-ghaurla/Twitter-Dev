import {asyncHandler} from "../utiles/asyncHandler.js"
import{apiError} from "../utiles/ApiError.js"
import {apiResponse} from "../utiles/apiResponse.js"
import{createHashtag,bulkCreateHashtags,findByName} from "./hashtag.controller.js"
import {Tweet} from "../models/tweet.model.js"
import mongoose from "mongoose"
import {Views} from "../models/views.model.js"
import { uploadOnCloudinary,deleteManyImageOnCloudinary } from "../utiles/cloudinary.js"
import fs from "fs"
import { response } from "express"

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
     const {content} = req.body
     const files = req.files
     console.log(files, "array test")

     let mediaPath
     if(files && Array.isArray(files) && req.files.length >0){
      mediaPath=  files.map( (file)=> file?.path)
     }
     
     console.log(mediaPath,"media path")
     const folderName = "/Twitter-Project/tweet-media"

     let uploadedMedia
     
    
     if(mediaPath){
      uploadedMedia =  await Promise.all(mediaPath.map(async (path)=> await uploadOnCloudinary(path,folderName)))
       
      
     }
    
     
    let response
    if(mediaPath){
         response=  await Promise.all(uploadedMedia.map(async(media)=>{
            const mediaUrl = media?.url || ""
            const mediaPublicId = media?.public_id || ""
    
       return{mediaUrl,mediaPublicId}
         }))
    }



     
        if(!content){
         throw new apiError(400,"tweet content is required")
        }


      
        

       
     
     // create tweet
 
     const tweet = await Tweet.create({
         content:content,
         postedBy:user._id,
         media:response
        
        
        
        
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

    let files 
    files  = fs.existsSync(mediaPath)
    if(files){
        fs.unlinkSync(mediaPath)
    }

    throw new apiError(500,"error in creating tweet",
        console.log(error)
    )
    
   }
   
})

const deleteTweet = asyncHandler(async(req,res)=>{

   try {
     const user = req.user
     const tweetId = req.params.ObjectId
     console.log("tweet id =>",tweetId)
 
     if(!tweetId){
         throw new apiError(400, "tweet ID is missing")
     }
 
   const tweet=  await Tweet.findById(tweetId).select("media")
     
     const files = tweet.media
     console.log(files,"fles")
     let publicIds
     if(files){
         publicIds = files.map((file)=> file.mediaPublicId)
     }
 
 
     
     // delete the cloudinary image if available
 
     await deleteManyImageOnCloudinary(publicIds) //delete only images
  
     // delete the tweet
 
      await Tweet.findByIdAndDelete(tweetId)
 
     // // remove from the user array
     
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
   } catch (error) {
    
    throw new apiError(500,"error in deleting tweet",
        console.log(error)
    )
   }
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
     const {tweetId} = req.params
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
                from:"users",
                localField:"postedBy",
                foreignField:"_id",
                as:"postedBy",
                pipeline:[
                   
                  
                    {
                        $project:{
                            _id:1,
                            username:1,
                            fullName:1,
                            avtar:1,
                           
                        }
                    }
                ]
            },
            
        },
        {
            $lookup:{
                from:"likes",
                localField:"likes",
                foreignField:"_id",
                as:"likes",
                pipeline:[

                    {
                        $lookup:{
                            from:"users",
                            localField:"likedBy",
                            foreignField:"_id",
                            as:"likedBy",
                            pipeline:[
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
                                        followStatus:{
                                            $cond:{
                                                if :{
                                                    $in:[req.user?._id,"$followers.follower"]
                                                },
                                                then:true,
                                                else:false,
                                            },
            
                                        }
                                    }
                                },
                                {
                                    $project:{
                                        username:1,
                                        fullName:1,
                                        avtar:1,
                                        followStatus:1,
                                       
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            likedBy:{
                                $first:"$likedBy"
                            }
                        }
                    },
                  
                    {
                        $project:{
                            likedBy:1,
                           
                        }
                    }
                ]
            }
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
                postedBy:1,
                followStatus:1,
                likes:1
            }
        },
        // console.log("final"),
       

    ])

    console.log('tweet', tweet)

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

const getTweetsInBulk = asyncHandler(async(req,res)=>{
   try {
     const pageNo = Number(req.query.pageNo) || 1
     const limit = 6
 
     const skip = (pageNo - 1) * limit
 
     const tweets = await Tweet.aggregate([
        { $sort: { createdAt: -1 }  }, 
        { $skip: skip },
         { $limit: limit  },
        {
          $lookup: {
            from: "users",
            localField: "postedBy",
            foreignField: "_id",
            as: "postedBy",
            pipeline: [
              {
                $lookup: {
                  from: "follows",
                  localField: "_id",
                  foreignField: "following",
                  as: "followers",
                },
              },
              {
                $lookup: {
                  from: "follows",
                  localField: "_id",
                  foreignField: "follower",
                  as: "followingTo",
                },
              },
              {
                $project: {
                  _id: 1,
                  username: 1,
                  fullName: 1,
                  avatar: 1,
                  
                },
              },
            ],
          },
        },
        
        {
          $addFields: {
            likeCount: { $size: { $ifNull: ["$likes", []] } },
            commentCount: { $size: { $ifNull: ["$comments", []] } },
            viewCount: { $size: { $ifNull: ["$views", []] } },

            followStatus:{
                $cond:{
                    if :{
                        $in:[req.user?._id,"$postedBy.followers.follower"]
                    },
                    then:true,
                    else:false,
                }
            },
            followers:{

            }
            
          },
        },
        {
          $project: {
            
            content: 1,
            imageUrl: 1,
            likeCount: 1,
            commentCount: 1,
            viewCount: 1,
            postedBy: 1,
            followStatus: 1,
          },
        },
      ]);
      
 
     if(tweets.length >0) res.status(200).json({
         success:true,
         tweets: tweets,
         message:'Tweets fetched successfully'
     })
   } catch (error) {
    throw new apiError(500,
        "error in fetching tweet",
        console.log(error))
   }
})


export{createTweet,deleteTweet,fetchTweet, getTweetsInBulk}