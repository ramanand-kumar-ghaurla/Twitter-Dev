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
        .isLowercase()
        .withMessage("username must be in lower case")
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
         .withMessage("full name is required")
         .isString()
         .withMessage("full name must be a string")
         .isLength({max:25})
         .withMessage("full name must be at most 25 characters")
         
        ,



    ]
}

const userLoginValidator = () => {
    return [
      body("email").optional().isEmail().withMessage("Email is invalid"),
      body("username").optional().isLowercase().withMessage("username must be in lower case"),
      body("password").notEmpty().withMessage("Password is required"),
    ];
  };

  const updateccountDetailsValidator= ()=> {
   return[ body("username")
        .trim()
        .optional({checkFalsy:true})
        .isLength({min:7})
        .withMessage("username must be at least 7 characters")
        .matches(
             /^(?=.*[a-z])(?=.*[0-9_.].)[a-z0-9_.]{7,30}$/
        )
        .withMessage("username must be coantain only lowercase, alphanumeric and special characters '_' and '.' "),

        body("fullName")
        .isString()
        .withMessage("full name must be a string")
        .optional()
        .isLength({max:25})
        .withMessage("full name must be at most 25 characters")
       
        
];
  };

  export { userRestrationValidation,userLoginValidator,updateccountDetailsValidator}