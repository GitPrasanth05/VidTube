import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const ConnectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DB_URI}/${DB_NAME}`
    );
    console.log(
      ` \n DB is connected successfully at Db Host:  ${connectionInstance.connection.host} `
    );
  } catch (error) {
    console.log("mongoose connectivity error");
    // process.exit(1); //  this is used to exit the process
  }
};

export default ConnectDB;
