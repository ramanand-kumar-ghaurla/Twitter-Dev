import mongoose,{Schema} from "mongoose";


const commentSchema= new Schema(
    {
        onModel:{
            type:String,
            enum:["Tweet","Comment"],
            required:true,
        },

        commentable:{
            type:Schema.Types.ObjectId,
            required:true,
            refPath:'onModel',

        },
        commentedBy:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }

    },{timestamps:true}
)

export const Comment=mongoose.model("Comment",commentSchema);