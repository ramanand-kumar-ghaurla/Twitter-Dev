import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config();
import bodyParser from "body-parser";


const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))


app.use(express.json(
    {limit:"20kb"}
))

app.use(bodyParser.json());
app.use(cors({
    credentials:true,
    origin:'http://localhost:5173'
}))


app.use(express.urlencoded({
    limit:"20kb",
    extended:true,
}))
app.use(express.static("public"))
app.use(cookieParser())

// import the routes
import userRouter from "./routes/user.route.js";
import followRouter from "./routes/follow.route.js"
import tweetRoute from "./routes/tweet.route.js"
import likeRoute from "./routes/like.route.js"
import commentRoute from "./routes/comment.route.js"

// declaration of routes 

app.use("/api/v1/user" , userRouter);
app.use("/api/v1/follow-service",followRouter)
app.use("/api/v1/tweets",tweetRoute)
app.use("/api/v1/likes",likeRoute)
app.use("/api/v1/comments",commentRoute)


export {app};