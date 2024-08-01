import express from "express";
import { Router } from "express";
import {loginUser, registerUser,logoutUser,refereshAccessToken} from '../controllers/user.controller.js';
import bodyParser from "body-parser";
import {verifyJwt} from "../middlewares/verifyJWT.js"
import {validate} from "../validators/validate.js"
import { userRestrationValidation,userLoginValidator} from "../validators/auth.validate.js"; 


const router = Router()
router.use(bodyParser.json());

// public routes

router.route("/register").post( userRestrationValidation(),validate,registerUser)
router.route("/login").post(userLoginValidator(),validate,loginUser)

// secured routes

router.route("/logout").post(verifyJwt,logoutUser)
router.route("/referesh-access-token").post(refereshAccessToken)







export default router;
