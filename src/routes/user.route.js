import express from "express";
import { Router } from "express";
import {loginUser, registerUser,logoutUser,refereshAccessToken} from '../controllers/user.controller.js';
import bodyParser from "body-parser";
import {verifyJwt} from "../middlewares/verifyJWT.js"


const router = Router()
router.use(bodyParser.json());

// public routes

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

// secured routes

router.route("/logout").post(verifyJwt,logoutUser)
router.route("/referesh-access-token").post(refereshAccessToken)







export default router;
