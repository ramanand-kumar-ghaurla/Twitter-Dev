import {cloudinaryConfig} from  "../config/cloudinary.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from "node:fs"

const uploadOnCloudinary = async function (localFilePath){
   try {
    if(!localFilePath) return null
    // upload on cloudinary

   const response =await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"

    })

    console.log("uploaded image on cloudinary", response);
    return response
   } catch (error) {
    console.error("error in uploading on cloudinary: ",error)
    fs.unlinkSync(localFilePath);


   }
}
export{uploadOnCloudinary};