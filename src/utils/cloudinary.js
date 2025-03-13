import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
//configure cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(
      "the file is uploaded to the cloudinary successfully : file type" +
        result.resource_type +
        "file source" +
        result.url
    );

    fs.unlinkSync(localFilePath); // this is used  after receiving the file we are deleting it from the local storage or server
    return;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};
