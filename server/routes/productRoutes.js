import express from "express";
import {
  createProduct,
  updateProduct,
  getAllProducts,
  getProduct,
  deleteProduct,
} from "../controllers/productControllers.js";
import { handleUpload } from "../middlewares/multer.js";
import isAuth from "../middlewares/authMiddleware.js";
import isUser from "../middlewares/isUser.js";

const router = express.Router();
const uploadMiddleware = handleUpload("productImage", 5); // maximum product image can be 5

router.post("/create", isAuth, isUser, uploadMiddleware, createProduct);
router.get("/all-products", getAllProducts);
router.get("/:id", getProduct);
router.patch("/update/:id", isAuth, isUser, uploadMiddleware, updateProduct);
router.delete("/delete/:id", isAuth, isUser, deleteProduct);

export default router;
