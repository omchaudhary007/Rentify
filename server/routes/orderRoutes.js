import express from "express";
import {
  addOrder,
  cancelOrder,
  getUserOrder,
  undeliveredOrder,
  reNewOrder,
  verifyPayment,
} from "../controllers/orderControllers.js";
import isAuth from "../middlewares/authMiddleware.js";
import isUser from "../middlewares/isUser.js";
import isDeliveryman from "../middlewares/isDeliveryman.js"

const router = express.Router();

// user-related endpoints
router.get("/myorder", isAuth, isUser, getUserOrder);
router.post("/:productId", isAuth, isUser, addOrder);
router.post("/:orderId/verify", isAuth, isUser, verifyPayment);
router.patch("/:orderId/cancel", isAuth, isUser, cancelOrder);
router.patch("/:orderId/renew", isAuth, isUser, reNewOrder);

// delivery-man routes

router.get("/undelivered",isAuth,isDeliveryman,undeliveredOrder);

export default router;
