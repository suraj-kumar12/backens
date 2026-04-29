import { Router } from "express";
import {
  addReviews,
  authWithGoogle,
  deleteMultiple,
  forgotPasswordController,
  getAllReviews,
  getAllUsers,
  getReviews,
  loginUserController,
  logoutController,
  refreshToken,
  registerUserController,
  removeImageFromCloudinary,
  resetPassword,
  updatePassword,
  updateUserDetails,
  userAvatarController,
  userDetails,
  verifyEmailController,
  verifyForgotPasswordOtp,
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const userRouter = Router();
//

userRouter.post("/register", registerUserController);
userRouter.post("/verifyEmail", verifyEmailController);
userRouter.post("/login", loginUserController);
userRouter.post("/authWithGoogle", authWithGoogle);
userRouter.get("/logout", auth, logoutController);
userRouter.put(
  "/user-avatar",
  auth,
  upload.array("avatar"),
  userAvatarController
);
// userRouter.get(
//   "/user-avatar",
//   auth,
//   upload.array("avatar"),
//   userAvatarController
// );
userRouter.delete("/deleteImage", auth, removeImageFromCloudinary);
userRouter.put("/:id", auth, updateUserDetails);
userRouter.post("/forgot-password", forgotPasswordController);
userRouter.post("/verify-Forgot-Password-Otp", verifyForgotPasswordOtp);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/update-password", updatePassword);
userRouter.post("/refresh-token", refreshToken);
userRouter.get("/user-details", auth, userDetails);
userRouter.post("/addReview", auth, addReviews);
userRouter.get("/getAllReviews", auth, getAllReviews);
userRouter.get("/getAllUsers", auth, getAllUsers);
userRouter.delete("/deleteMultiple", deleteMultiple);
export default userRouter;
