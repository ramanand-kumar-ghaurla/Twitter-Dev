import mongoose,{Schema} from "mongoose";


const commentSchema= new Schema(
    {
        content:{
            type:String,
            required:true
        },

        onModel:{
            type:String,
            enum:["Tweet","Comment"],
            required:true,
        },

        commentedModel:{
            type:Schema.Types.ObjectId,
            required:true,
            refPath:'onModel',

        },
        commentedBy:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        comments:[
            {
            type:Schema.Types.ObjectId,
            ref:"Comment"
            }
    ]

    },{timestamps:true}
)

export const Comment=mongoose.model("Comment",commentSchema);