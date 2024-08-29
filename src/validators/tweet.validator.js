import { body } from "express-validator";

const tweetContentValidation = () => {
    return [
      body("content")
      .notEmpty()
      .isLength({max:300})
      .isString()
      .withMessage("tweet cotent must be  in string format")
     
      
     ];
  };
export{tweetContentValidation}