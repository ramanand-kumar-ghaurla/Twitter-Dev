import express from "express";
import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJWT.js";


const router = Router()

// import the controller

import { toggleLike,getLikeStatus,getLikes } from "../controllers/like.controller.js";

// define the route
router.route("/toggle-like").post(verifyJwt,toggleLike)
router.route("/get-likestatus").get(verifyJwt,getLikeStatus)
router.route("/get-likes").get(verifyJwt,getLikes)

export default router