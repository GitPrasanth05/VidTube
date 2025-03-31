import { Router } from "express";
import {
  RegisterUser,
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/User.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
const router = Router();
// router.post("/register", RegisterUser);

//unsecure routes
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  RegisterUser

  //router.post('/register', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), RegisterUser);
);
// here upload.fields is given as it gets avatar and cover image .

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

//secure routes
router.route("/logout").post(verifyJwt, logoutUser);
//first middleware it would do some process then add the control route
router.route("/change-password").post(verifyJwt, changeCurrentPassword);
router.route("/current-User").get(verifyJwt, getCurrentUser);
router.route("/c:username").get(verifyJwt, getUserChannelProfile);

//for update do not use get or post use patch

router.route("/update-account").patch(verifyJwt, updateAccountDetails);

router
  .route("/update-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
router
  .route("/update-cover")
  .patch(verifyJwt, upload.single("cover"), updateUserCoverImage);

router.route("/history").get(verifyJwt, getWatchHistory);

export default router;
