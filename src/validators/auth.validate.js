import { body } from "express-validator";


const userRestrationValidation = () =>{
    return[
        body("email")
        .trim()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("Provide a valid email"),
        
        body("username")
        .trim()
        .notEmpty()
        .withMessage("username is required")
        .isLength({min:7})
        .withMessage("username must be at least 7 characters")
        .matches(
             /^(?=.*[a-z])(?=.*[0-9_.].)[a-z0-9_.]{7,30}$/
        )
        .withMessage("username must be coantain only lowercase, alphanumeric and special characters '_' and '.' ")
        ,

         body("password")
         .trim()
         .notEmpty()
         .withMessage("password is required")
         .isLength({min:8},{max:20})
         .withMessage("password must be at least 8 characters")
         .matches(
            
/^\S*(?=\S{8,20})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/
         )
         .withMessage("password must be containing one uppercase, lowercase and special symbol"),

         body("fullName")
         .notEmpty()
         .withMessage("full name is required"),



    ]
}

const userLoginValidator = () => {
    return [
      body("email").optional().isEmail().withMessage("Email is invalid"),
      body("username").optional(),
      body("password").notEmpty().withMessage("Password is required"),
    ];
  };

  export { userRestrationValidation,userLoginValidator}