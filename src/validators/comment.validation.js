import { body } from "express-validator";

const commentValidation = ()=>{
    return [
    body("content")
    .notEmpty()
    .withMessage("comment must have some content")
    .isLength({max:300})
    .withMessage("comment must have 300 characters at most")
    .isString()
    .withMessage("comment must have string")
];
}

export {commentValidation}