import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJWT.js";

const router = Router()

// import controllers

import { createComment,getCommentsOfTweet } from "../controllers/comment.controller.js";

// define the routes

router.route("/create-comment").post(verifyJwt,createComment)
router.route("/tweet-comments").get(verifyJwt,getCommentsOfTweet)


export default router