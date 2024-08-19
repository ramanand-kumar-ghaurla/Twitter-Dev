import {asyncHandler} from "../utiles/asyncHandler.js"
import{apiError} from "../utiles/ApiError.js"
import {User} from "../models/user.model.js"
import {apiResponse} from "../utiles/apiResponse.js"
import{createHashtag,bulkCreateHashtags,findByName} from "./hashtag.controller.js"
import { Hashtag } from "../models/hashtag.model.js"
import {Tweet} from "../models/tweet.model.js"

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
 
     // extract hashtags 

     const manageHashtags = async(content)=>{

        try {
            let tags = content.match(/#[a-zA-Z0-9_]+/g) // regex for matching hashtags
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
    
     const createdTags = await manageHashtags(content)
     
 
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

export{createTweet}