
import mongoose,{Schema} from "mongoose";
import jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from 'dotenv'
dotenv.config();

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
        required:true,
        trim:true,
        index:true
    },

    avtar:{
        type:String,
        

    },
    coverImage:{
        type:String
    },
    
    refereshToken:{
        type:String,
    },
    password:{
        type:String,
        required:true,
        trim:true,
    },

    posts:[
        {
            type:Schema.Types.ObjectId,
            ref:"Tweet"
        }
    ],
    

}, {timestamps:true})

// encrypt the password



userSchema.pre("save", async function (next){
    console.log(this.password)
    
    if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password,10)
    console.log(this.password)
        next()
    }
});



// checck if the password is correct or not

userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password,this.password)

};

// generating access and referesh tokens

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username: this.username,
            fullName: this.fullName
        },
        
        process.env.ACCESS_TOKEN_SECRET,
        {
         expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
        
    )
}

userSchema.methods.generateRefereshToken= function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFFERESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFFERESH_TOKEN_EXPIRY
        }
    )
};



export const User = mongoose.model("User",userSchema);