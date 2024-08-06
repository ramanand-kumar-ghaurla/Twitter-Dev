import mongoose ,{ Schema }from "mongoose";  

const followSchema = new Schema(
    {
        follow:{
            type: Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },

        following:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true,
        }
    },{timestampsz:true}
);

export const Follow = mongoose.model("Follow",followSchema)
