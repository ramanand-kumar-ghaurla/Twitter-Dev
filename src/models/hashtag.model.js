import mongoose,{Schema} from "mongoose";


const hashtagSchema= new Schema(
    {
        title:{
            type:String,
            required:true,
        },

        tweets:[ {
             type:Schema.Types.ObjectId,
            ref:"User"
        }]
        

    },{timestamps:true}
)

export const Hashtag = mongoose.model("Hashtag",hashtagSchema);