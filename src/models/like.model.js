import mongoose,{Schema} from "mongoose";


const likeSchema= new Schema(
    {
        onModel:{
            type:String,
            enum:["Tweet","Comment"],
            required:true,
        },

        likable:{
            type:Schema.Types.ObjectId,
            required:true,
            refPath:'onModel',

        },
        likedBy:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }

    },{timestamps:true}
)

export const Like=mongoose.model("Like",likeSchema);