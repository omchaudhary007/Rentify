import express from "express";
import {
  addToCart,
  clearCart,
  getCartItems,
  removeFromCart,
} from "../controllers/cartControllers.js";
import isAuth from "../middlewares/authMiddleware.js";
import isUser from "../middlewares/isUser.js";

const router = express.Router();

router.get("/add/:productId", isAuth, isUser, addToCart);
router.get("/remove/:productId", isAuth, isUser, removeFromCart);
router.get("/items", isAuth, isUser, getCartItems);
router.get("/clear", isAuth, isUser, clearCart);

export default router;
