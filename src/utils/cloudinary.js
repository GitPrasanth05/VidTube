import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

//configure cloudinary

dotenv.config();

const uploadOnCloudinary = async (localFilePath) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY, // Click 'View API Keys' above to copy your API secret
    });
    if (!localFilePath) {
      throw new Error("File path is undefined or invalid.");
    }

    // console.log(cloudinary);

    console.log("Cloudinary ENV:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING",
      api_secret: process.env.CLOUDINARY_SECRET_KEY ? "SET" : "MISSING",
    });

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
    return result;
  } catch (error) {
    console.log("Error on Cloudinary", error);

    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId); //this is used to delete a file from the cloudinary
    console.log("deleted from cloudinary");
  } catch (error) {
    console.log("Error in deleting from cloudinary", error);
    // throw new ApiError(500, "ERROR IN DELETING FILES FROM CLOUDINARY");
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
