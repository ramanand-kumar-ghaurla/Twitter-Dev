import dotenv from "dotenv";
dotenv.config()
console.log(process.env)

import connectDB from "./config/database.js";


connectDB()