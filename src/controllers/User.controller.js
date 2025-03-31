import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const access = user.generateAccessToken();
    const refresh = user.generateRefreshToken();

    user.refreshToken = refresh;
    await user.save({ validateBeforeSave: false });

    return { access, refresh };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh token "
    );
  }
};

const RegisterUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  console.log(req.files);
  //   if (fullname?.trim() === "") {
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  //you can use ZOd instead
  // User.findOne({ email });
  //to check if the email is already present in the database
  const userExist = await User.findOne({
    // here using await operations as user is from database
    $or: [{ username }, { email }], // here or is aggregation query by mongodb which is used to check if the username or email is already present in the database
  });

  if (userExist) {
    throw new ApiError(402, "User with the same name or email already exists");
  }

  console.warn(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path; // to check whether the file is present or not , as this is from multer this has more options
  const coverImageLocalPath = req.files?.coverImage[0]?.path; //as multer file it have more options

  console.log(avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(404, "Avatar is not found");
  }

  // const avatar = await uploadOnCloudinary(avatarLocalPath);

  // let cover = "";
  // if (coverImageLocalPath) {
  //   cover = await uploadOnCloudinary(coverImageLocalPath);
  // }

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("avatar is uploaded successfully ", avatar);
  } catch (error) {
    console.log("error on uploading avatar", error);
    throw new ApiError(500, "failed to upload avatar");
  }

  let cover;
  try {
    cover = await uploadOnCloudinary(coverImageLocalPath);
    console.log("cover Image is uploaded successfully");
  } catch (error) {
    console.log("Error in uploading cover image");
    throw new ApiError(500, "error in uploading cover image");
  }

  try {
    const user = await User.create({
      fullname,
      avatar: avatar.url, // as only the url goes to the db
      coverImage: cover.url || "",
      email,
      // password ,
      password: await bcrypt.hash(password, 10),
      username: username.toLowerCase().trim(),
    });

    // to check whether the user is created or not
    //here we
    const userCreated = await User.findById(user._id).select(
      "-password -refreshToken" //giving - and name of the field as this should not displayed in the response
    );

    if (!userCreated) {
      throw new ApiError(500, "Something went wrong while creating the user");
    }

    return res
      .status(201, "User created successfully")
      .json(new ApiResponse(202, userCreated, "User created successfully"));
  } catch (error) {
    console.log("user creation failed ", error);

    if (cover) {
      await deleteFromCloudinary(cover.public_id);
    }

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }

    throw new ApiError(500, "something went wrong while registering user ");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username) {
    throw new ApiError(500, "email or username required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(500, "no user found");
  }

  const pass = await user.isPasswordCorrect(password);

  if (!pass) {
    throw new ApiError(500, "Password is invalid");
  }

  const { access, refresh } = await generateAccessAndRefreshToken(user._id);

  const loggedIn = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // here the selects works oppsosite it deselect it alone

  const options = {
    //it is a javascript object
    httpOnly: true, //this allows only the admin to change the cookie not by the user
    secure: process.env.NODE_ENV === "production", //this tells that give me security when the project is on production
  };

  res
    .status(200)
    .cookie("accessToken", access, options) //this is sen to the cookie with the security options
    .cookie("refreshToken", refresh, options) //this is sent to the cookie
    .json(
      new ApiResponse(
        200,
        //instead og loggedIn {user:loggedIn,accesstoken,refreshtoken}  here you send respone like this if you are creating a mobile app because mobile app has no cookie
        loggedIn,
        "User logged in Successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken; //if mobile app refresh token will come from body

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_SECRET
    );
    if (!decoded) {
      throw new ApiError(500, "refresh token is not found");
    }
    const user = await User.findById(decoded._id);

    if (!user) {
      throw new ApiError(500, "no user found with this id");
    }
    if (incomingRefreshToken != user.refreshToken) {
      //  "?." becuase it might have error or niot
      throw new ApiError(500, "refresh token is invalid");
    }

    const { access, refresh: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return (
      res
        .status(200)
        .cookie("accessToken", access, options)
        .cookie("refreshToken", newRefreshToken, options)
        // .cookie("refreshToken",newRefreshToken,options)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken: newRefreshToken },
            "Access token refreshed successfully"
          )
        )
    );
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while refreshing the access token"
    );
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined, // here you can give  ""  ,  null but undefined works well with this
      },
    },
    { new: true } //this is used to get the updated document
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loggedOut successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(500, "no user found with this id");
  }

  const passValid = await user.isPasswordCorrect(oldpassword);
  if (!passValid) {
    throw new ApiError(500, "old password is invalid");
  }

  User.password = newpassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "these are the current user details"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError(500, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.files?.path;
  if (!avatarLocalPath) {
    throw new ApiError(500, "Avatar is not found");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, "failed to upload avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  res.status(200).json(new ApiResponse(200, {}, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  coverImageLocalPath = req.files?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(500, "Cover Image is not found");
  }
  const cover = await uploadOnCloudinary(coverImageLocalPath);
  if (!cover.url) {
    throw new ApiError(500, "failed to upload cover image");
  }

  const user = User.findByIdAndUpdate(
    req.User._id,
    {
      $set: {
        coverImage: cover.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        email: 1,
      },
    },
  ]);

  if (!channel) {
    throw new ApiError(400, "no channel found with this username");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "user profile fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
                {
                  $addFields: {
                    owner: {
                      $first: "$owner",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0]?.watchHistory,
        "Watch HIstory fetched successfully"
      )
    );
});

export {
  RegisterUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getCurrentUser,
  getWatchHistory,
  getUserChannelProfile,
};
