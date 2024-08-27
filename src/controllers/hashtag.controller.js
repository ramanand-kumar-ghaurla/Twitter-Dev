
import {asyncHandler} from "../utiles/asyncHandler.js"
import{apiError} from "../utiles/ApiError.js"
import {apiResponse} from "../utiles/apiResponse.js"
import { Hashtag } from "../models/hashtag.model.js"


const createHashtag = async(data)=>{
    try {
        if(!data){
            throw new apiError(401,"data is missing")
        }

    const hashtag =    await Hashtag.create(
            data
        )

        return hashtag
    } catch (error) {
        throw new apiError(500,"error in creating hashtag",
            console.log(error)
        )
    }
}

const bulkCreateHashtags = async(data)=>{
    try {
        
        const hashtags = await Hashtag.insertMany(data)

        return hashtags

    } catch (error) {
        throw new apiError(500 , "error in creating hashtags in bulk",
            console.log(error)
        )
        
    }
}


const findByName = async(titleList)=>{
    try {

        const hashtags = await Hashtag.find({title:titleList})
        
        return hashtags
    } catch (error) {
      throw new apiError(500,"error in finding hashtags by name",
        console.log(error)
      )  
    }
}

const tweetsOfHashtag = async(req,res)=>{

    try {
        const {title} = req.params

        if(!title){
            throw new apiError(400, "hashtag title is required")
        }



       const tweets= await Hashtag.aggregate([
            {
                $match:{
                    title:title.toLowerCase()
                }
            },

            {
                $lookup:{
                    from:"tweets",
                    localField:"tweets",
                    foreignField:"_id",
                    as:"tweets"
                }
            },

            {
                $project:{
                    title:1,
                    tweets:1
                }

            }
        ])

        if(!tweets?.length){
            throw new apiError(404, "hashtag is not found")
        }

        res.status(200).json(
            new apiResponse(200,
                tweets[0],
               ` tweets related to " ${title} " is   feched successfully`,
            )
        )
        console.log(tweets)

   
   
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"error in finding hashtags",
            
        })
       
        
       
    }
}





export {createHashtag,bulkCreateHashtags,findByName,tweetsOfHashtag}

