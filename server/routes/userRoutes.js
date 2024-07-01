import express from "express";
import isAuth from "../middlewares/authMiddleware.js";
import {
  changeEmailController,
  changepasswordController,
  createUser,
  deleteAccountController,
  getUserProfileController,
  loginController,
  logoutController,
  passwordResetController,
  updateProfileController,
  updateProfilePicController,
} from "../controllers/userControllers.js";
import { handleUpload } from "../middlewares/multer.js";

const router = express.Router();

const uploadMiddleware = handleUpload("image");
router.post("/register", createUser);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/profile", isAuth, getUserProfileController);
router.patch("/profile", isAuth, updateProfileController);
router.patch("/profile/picture", isAuth, uploadMiddleware, updateProfilePicController);
router.patch("/profile/email", isAuth, changeEmailController);
router.patch("/profile/password", isAuth, changepasswordController);
router.post("/password/reset", passwordResetController);
router.delete("/profile", isAuth, deleteAccountController);

export default router;
