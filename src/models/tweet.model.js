import mongoose,{Schema} from "mongoose";
import { paginate } from "mongoose-paginate-v2";

const tweetSchema=new Schema(
    {
        content:{
            type:String,
            required:true,
            maxLengh:[300,'Tweet must be less than 300 characters'],
            trim:true,
        },

        imageUrl:{
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
        views:[
            {
                type:Schema.Types.ObjectId,
                ref:"Views"
            }
        ]
        

    },{timestamps:true}
)


export const Tweet = mongoose.model("Tweet",tweetSchema);

