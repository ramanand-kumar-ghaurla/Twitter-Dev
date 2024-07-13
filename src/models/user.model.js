
import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true,
        index:true,
    },

    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },

    fullName:{
        type:String,
        require:true,
        trim:true,
        index:true
    },

    avtar:{
        type:String,
        required:true,

    },

    posts:[
        {
            type:Schema.Types.ObjectId,
            ref:"Tweet"
        }
    ],
    

}, {timestamps:true})


export const User = mongoose.model("User",userSchema);