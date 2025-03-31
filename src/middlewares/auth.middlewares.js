import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.headers("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET);
    if (!decodedToken) {
      throw new ApiError(401, "Unauthorized");
    }
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(500, error?.message || "invalid token ");
  }
});
