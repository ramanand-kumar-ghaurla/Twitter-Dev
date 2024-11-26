import express from "express";
import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJWT.js";
import { isOwner } from "../middlewares/isOwner.middleware.js";
import {validate} from "../validators/validate.js"
import { upload } from "../middlewares/multer,middleware.js";

const router = Router()

// import validation methods
import { tweetContentValidation } from "../validators/tweet.validator.js";


// import controllers for routes
import {createTweet,
        deleteTweet,
        fetchTweet,
        getTweetsInBulk
} from "../controllers/tweet.controller.js"
import{tweetsOfHashtag} from "../controllers/hashtag.controller.js"

import { getViews } from "../controllers/view.controller.js";

// define routes

router.route("/create-tweet").post(verifyJwt,
        upload.array("media",2),
        tweetContentValidation(),validate,
        createTweet)
router.route("/hashtag/:title").get(verifyJwt,tweetsOfHashtag)
router.route("/delete-tweet/:ObjectId").post(verifyJwt,deleteTweet)
router.route("/tweet").get(verifyJwt,fetchTweet)
router.route("/get-tweets").get(verifyJwt, getTweetsInBulk)

// route only for post owner

router.route("/get-views/:ObjectId").get(verifyJwt,isOwner,getViews)

export default router