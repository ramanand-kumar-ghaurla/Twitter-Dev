import express from "express";
import { Router } from "express";
import {registerUser} from '../controllers/user.controller.js';
import bodyParser from "body-parser";


const router = Router()

router.route("/register").post(registerUser);
router.use(bodyParser.json());




export default router;
