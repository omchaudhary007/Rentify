import express from "express";
import { handleUpload } from "../middlewares/multer.js";
import isAuth from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
  createCategoryController,
  getCategoryController,
  updateCategoryController,
} from "../controllers/categoryControllers.js";

const router = express.Router();

// middleware for Category image upload
const singleUploadMiddleware = handleUpload("categoryImage");

router.post(
  "/create",
  isAuth,
  isAdmin,
  singleUploadMiddleware,
  createCategoryController
);
router.get("/all-categories", getCategoryController);
router.patch(
  "/update",
  isAuth,
  isAdmin,
  singleUploadMiddleware,
  updateCategoryController
);

export default router;
