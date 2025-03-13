import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
const RegisterUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

//   if (fullName?.trim() === "") {
  if()
    throw new ApiError(400, "All fields are required");
  }
});

export { RegisterUser };
