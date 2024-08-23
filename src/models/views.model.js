import mongoose ,{ Schema }from "mongoose";


const viewSchema = new Schema({
    
    post:{
        type:Schema.Types.ObjectId,
        ref:"Tweet",
        required:true
    },
    
    viewedBy: {
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
})

export const Views =  mongoose.model("Views",viewSchema)