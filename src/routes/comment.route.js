import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJWT.js";
import { validate } from "../validators/validate.js";
const router = Router()

// import validation methodes

import { commentValidation } from "../validators/comment.validation.js";

// import controllers

import { createComment,getCommentsOfTweet,getCommentOfComment } from "../controllers/comment.controller.js";

// define the routes

router.route("/create-comment").post(verifyJwt,commentValidation(),validate, createComment)
router.route("/tweet-comments").get(verifyJwt,getCommentsOfTweet)
router.route("/comments-replies").get(verifyJwt,getCommentOfComment)


export default router