import mongoose,{Schema} from "mongoose";

const tweetSchema=new Schema(
    {
        content:{
            type:String,
            required:true,
            maxLengh:[300,'Tweet must be less than 300 characters'],
            trim:true,
        },

        image:{
            type:String,
        
        },
        postedBy:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        likes:[
            {
            type:Schema.Types.ObjectId,
            ref:"Like",
        
            }
        ],
        comments:[
            {
            type:Schema.Types.ObjectId,
            ref:"Comment"
            }
        ],
        hashTags:[
            {
            type:Schema.Types.ObjectId,
            ref:"Hashtag"
            }
        ]

    },{timestamps:true}
)

export const Tweet = mongoose.model("Tweet",tweetSchema);