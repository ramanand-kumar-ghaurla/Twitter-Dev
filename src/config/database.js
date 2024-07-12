import mongoose from "mongoose";
import { configDotenv } from "dotenv";

const connectDB = async ()=>{
    try {
        const connectionIncetance = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DATABASE_NAME}`)
        console.log(`MONGODB is conneted !! DB host : ${connectionIncetance.connection.host}`);
        
    } catch (error) {
        console.log("mongoDB connection error", error);
        console.error()
        process.exit(1)
        
    }
}

export default connectDB