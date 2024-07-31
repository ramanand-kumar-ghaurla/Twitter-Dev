import express from "express";
import { Router } from "express";
import {loginUser, registerUser,logoutUser} from '../controllers/user.controller.js';
import bodyParser from "body-parser";
import {verifyJwt} from "../middlewares/verifyJWT.js"


const router = Router()
router.use(bodyParser.json());

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

router.route("/logout").post(verifyJwt,logoutUser)







export default router;
