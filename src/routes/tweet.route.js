import express from "express";
import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJWT.js";

const router = Router()

import {createTweet,
        deleteTweet
} from "../controllers/tweet.controller.js"
import{tweetsOfHashtag} from "../controllers/hashtag.controller.js"

// define routes

router.route("/create-tweet").post(verifyJwt,createTweet)
router.route("/hashtag/:title").get(verifyJwt,tweetsOfHashtag)
router.route("/delete-tweet/:ObjectId").post(verifyJwt,deleteTweet)

export default router