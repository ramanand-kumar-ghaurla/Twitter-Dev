import mongoose ,{ Schema }from "mongoose";  

const followSchema = new Schema(
    {
        follower:{
            type: Schema.Types.ObjectId,
            ref:"User",
            required:true
           
        },          // users who are following the owner profile

        following:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
              // users whome are following by owner `
        }
    },{timestamps:true}
);

export const Follow = mongoose.model("Follow",followSchema)
