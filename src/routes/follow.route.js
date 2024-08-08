import express from "express";
import { Router } from "express";

const router = Router()


import { verifyJwt } from "../middlewares/verifyJWT.js";
import {followUser,unfollowUser} from "../controllers/follow.controler.js";

router.route("/follow/:username").post(verifyJwt,followUser)
router.route("/unfollow/:username").post(verifyJwt,unfollowUser)


export default router