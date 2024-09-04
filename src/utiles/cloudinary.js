
import { v2 as cloudinary } from 'cloudinary';
import fs from "node:fs"
import dotenv from 'dotenv';
import { apiError } from './ApiError.js';
import { apiResponse } from './apiResponse.js';
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

    const response = await cloudinary.uploader.upload(localFilePath,{
      resource_type:"auto",
      folder:folderName
   })

    
    
    //console.log("uploaded image on cloudinary", response);
     fs.unlinkSync(localFilePath)
    return response;
    

   } catch (error) {
    
    fs.unlinkSync(localFilePath);

    throw new apiResponse(500,"error in uploading image on cloudinary", console.log(error))


   }
}


const deleteImageOnCloudinary = async function (publicId){
   try {
   
      if(!publicId) {
         throw new apiError(401, "pubic id is mendtory for deletion")
      }

     const response= await cloudinary.uploader.destroy(publicId,{
         resource_type:'image',
         
      })

      console.log("user image deleted successfully")
      return response


   } catch (error) {

      
    throw new apiError(500, "error in deleting avtar on cloudinary",console.log(error))
    


   }
}


const deleteManyImageOnCloudinary = async function (publicIds){
   try {
   
      if(!publicIds) {
         throw new apiError(401, "pubic id is mendtory for deletion")
      }

     const response= await cloudinary.api.delete_resources(publicIds)

      console.log("user images deleted successfully")
      return response


   } catch (error) {

      
    throw new apiError(500, "error in deleting multiple images on cloudinary",console.log(error))
    


   }
}
export{uploadOnCloudinary,deleteImageOnCloudinary,deleteManyImageOnCloudinary};