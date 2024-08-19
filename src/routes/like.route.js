import express from "express";
import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJWT.js";

const router = Router()

// import the controller

import { toggleLike } from "../controllers/like.controller.js";

// define the route
router.route("/toggle-like").post(verifyJwt,toggleLike)

export default router