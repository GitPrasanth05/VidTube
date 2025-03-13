import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const health = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(202, "OK", "Health Check Passed"));
}); // the second async is used for db

export { health };
