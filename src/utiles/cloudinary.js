
import { v2 as cloudinary } from 'cloudinary';
import fs from "node:fs"
import dotenv from 'dotenv';
dotenv.config()

cloudinary.config({
   cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
   api_key : process.env.CLOUDINARY_API_KEY,
   api_secret : process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async function (localFilePath,folderName){
   try {
    if(!localFilePath && folderName) return null
    // upload on cloudinary

   const response =await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto",
        folder:folderName,
        


    })

    
    console.log("uploaded image on cloudinary", response);
     fs.unlinkSync(localFilePath)
    return response;
    

   } catch (error) {
    console.error("error in uploading on cloudinary: ",error)
    fs.unlinkSync(localFilePath);


   }
}
export{uploadOnCloudinary};