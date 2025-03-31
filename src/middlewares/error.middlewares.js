import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const errorHandler = (err, req, res, next) => {
  let error = err;
  if (!error instanceof ApiError) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, error.message, error?.errors, error.stack);
  }

  const response = {
    ...error, // ... is destructuring operator
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}), //when the development is true then only the stack will be shown , that is project is in development mode and the error coming here should not show in production
  };

  return res.status(500).json(response);
};

export { errorHandler };
