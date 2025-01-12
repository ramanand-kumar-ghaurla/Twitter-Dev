import express from "express";
import { Router } from "express";
import { loginUser,
         registerUser,
        logoutUser,
        refereshAccessToken,
        changeUserPassword,
        updateccountDetails,
        updateUserAvtar,
        updateUserCoverImage,
        getUserProfile,
        deleteUser,
        getProfileInBulk
        
    } from '../controllers/user.controller.js';


import bodyParser from "body-parser";
import {verifyJwt} from "../middlewares/verifyJWT.js"
import { upload } from "../middlewares/multer,middleware.js";
import {validate} from "../validators/validate.js"
import { userRestrationValidation,
         userLoginValidator,
         updateccountDetailsValidator} from "../validators/auth.validate.js"; 


const router = Router()
router.use(bodyParser.json());
router.use(express.urlencoded({
    limit:"20kb",
    extended:true,
}))

// public routes

router.route("/register").post(

    upload.fields([
        {name:"avtar",maxCount:1},
        {name:"coverImage",maxCount:1}
                                        ]),
    userRestrationValidation(),
    validate,
    registerUser)



router.route("/login").post(userLoginValidator(),validate,loginUser)

// secured routes

router.route("/logout").post(verifyJwt,logoutUser)
router.route("/referesh-access-token").post(refereshAccessToken)
router.route("/change-password").post(verifyJwt,changeUserPassword)
router.route("/update-account-details").post(verifyJwt,
    updateccountDetailsValidator(),validate,
    updateccountDetails)
router.route("/update-avtar").post(verifyJwt,
                            upload.single("avtar"),
                            updateUserAvtar
)

router.route("/update-cover-Image").post(verifyJwt,
    upload.single("coverImage"),
    updateUserCoverImage
)

router.route("/c/:username").get(verifyJwt,getUserProfile);
router.route("/delete-account").post(verifyJwt,deleteUser)
router.route("/get-profiles-bulk").get(verifyJwt,getProfileInBulk);








export default router;
