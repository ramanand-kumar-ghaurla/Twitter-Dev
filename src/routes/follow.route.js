import express from "express";
import { Router } from "express";

const router = Router()


import { verifyJwt } from "../middlewares/verifyJWT.js";
import {togglefollow,getFollower, getFollowing} from "../controllers/follow.controler.js";

router.route("/togglefollow/:username").post(verifyJwt,togglefollow)
router.route("/get-follower/:username").get(verifyJwt,getFollower)
router.route("/get-following/:username").get(verifyJwt,getFollowing)


export default router