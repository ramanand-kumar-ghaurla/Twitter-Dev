import express from "express";
import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJWT.js";
import { isOwner } from "../middlewares/isOwner.middleware.js";
const router = Router()

import {createTweet,
        deleteTweet,
        fetchTweet
} from "../controllers/tweet.controller.js"
import{tweetsOfHashtag} from "../controllers/hashtag.controller.js"

import { getViews } from "../controllers/view.controller.js";

// define routes

router.route("/create-tweet").post(verifyJwt,createTweet)
router.route("/hashtag/:title").get(verifyJwt,tweetsOfHashtag)
router.route("/delete-tweet/:ObjectId").post(verifyJwt,deleteTweet)
router.route("/tweet").get(verifyJwt,fetchTweet)

// route only for post owner

router.route("/get-views/:ObjectId").get(verifyJwt,isOwner,getViews)

export default router