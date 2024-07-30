import express from "express";
import { Router } from "express";
import {loginUser, registerUser} from '../controllers/user.controller.js';
import bodyParser from "body-parser";


const router = Router()
router.use(bodyParser.json());

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)







export default router;
