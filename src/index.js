import dotenv from "dotenv";
dotenv.config();
import {app} from "./app.js"


import connectDB from "./config/database.js";


connectDB()
.then( ()=>{
    app.listen(process.env.PORT || 8000,
        ()=>{
           console.log( `server is running at port no. : ${process.env.PORT}`)
        }
    )
})
.catch((err)=>{
    console.error("error in server starting ", err)
})
