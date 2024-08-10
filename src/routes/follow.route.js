import express from "express";
import { Router } from "express";

const router = Router()


import { verifyJwt } from "../middlewares/verifyJWT.js";
import {followUser,unfollowUser,getFollower, getFollowing} from "../controllers/follow.controler.js";

router.route("/follow/:username").post(verifyJwt,followUser)
router.route("/unfollow/:username").post(verifyJwt,unfollowUser)
router.route("/get-follower/:username").get(verifyJwt,getFollower)
router.route("/get-following/:username").get(verifyJwt,getFollowing)


export default router