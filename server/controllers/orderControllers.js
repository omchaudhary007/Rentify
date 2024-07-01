import productModel from "../models/productModel.js";
import { distanceTimeFinder } from "../services/addressServices.js";
import orderModel from "../models/orderModel.js";
import {
  getDeliveryCharge,
  getNumberDuration,
} from "../services/validatorMethods.js";
import {
  createRazorpayOrder,
  verifySignature,
} from "../services/razorpayService.js";

export const addOrder = async (req, res) => {
  try {
    const { productId } = req.params;
    const { duration } = req.body;

    // verify product
    const product = await productModel
      .findById(productId)
      .populate("subcategory")
      .populate("owner", "address");
    if (!product) {
      return res.status(400).send({
        success: false,
        message: "Product not found.",
      });
    }
    // check if product is available
    if (product.outOfStock) {
      return res.status(400).send({
        success: false,
        message: "Product is out of stock.",
      });
    }

    // check duration is valid
    const numberDuration = getNumberDuration(duration);
    if (!numberDuration) {
      return res.send({
        success: false,
        message: "Please select valid duration.",
      });
    }

    // check if same pincode or under 100km
    const { address: ownerAddress } = product.owner;
    const { address: userAddress } = req.userData;
    let isAllowedArea = false;
    let predictedTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // default is 2 days

    if (userAddress.pincode === ownerAddress.pincode) {
      isAllowedArea = true;
    } else {
      const distanceTime = await distanceTimeFinder(
        { lng: userAddress.lng, lat: userAddress.lat },
        { lng: ownerAddress.lng, lat: ownerAddress.lat }
      );
      if (distanceTime.success && distanceTime.distance <= 100) {
        isAllowedArea = true;
        predictedTime = new Date(Date.now() + distanceTime.duration * 1000);
      }
    }
    if (!isAllowedArea) {
      return res.status(400).send({
        success: false,
        message: "Product not available in your area.",
      });
    }

    // initiating a payment order
    const percantage = parseFloat(product.subcategory[duration]); // duration percentage
    const amount = parseInt((parseInt(product.price) * percantage) / 100);
    const deliveryCharge = getDeliveryCharge(
      product.weight,
      product.length,
      product.widhth,
      product.height
    );
    const paymentOrder = {
      amount: (amount + 2 * deliveryCharge) * 100, // in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        productId,
        userId: req.userData._id,
        deliveryCharge,
        deliveryEstimate: predictedTime,
      },
    };
    const { id: paymentOrderId } = await createRazorpayOrder(paymentOrder);

    // create order
    const order = await orderModel.create({
      user: req.userData._id,
      product: productId,
      productPincode: ownerAddress.pincode,
      price: [amount],
      deliveryCharge,
      duration: [numberDuration],
      paymentOrderId: [paymentOrderId],
      deliveryDate: predictedTime,
      confirmationDate: new Date(Date.now()),
    });

    return res.status(200).send({
      success: true,
      message: "Order created successfully.",
      order,
      paymentOrderId,
    });
  } catch (error) {
    res.status(501).send({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).send({
        success: false,
        message: "Missing verification fields",
      });
    }
    const isPaymentValid = verifySignature(req.body);
    const order = await orderModel.findByIdAndUpdate(orderId, { isPaid: true });

    if (!isPaymentValid || !order) {
      return res.status(400).send({
        success: false,
        message: "Payment Verification failed.",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Payment successful.",
    });
  } catch (error) {
    res.status(501).send({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const currentDate = new Date();

    const order = await orderModel.findByIdAndUpdate(
      {
        _id: orderId,
        deliveryDate: {
          $gte: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000),
        }, // can cancel only if request within 2days
      },
      {
        orderStatus: "cancelled",
        isRefunded: false,
        cancelDate: new Date(),
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found.",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Order cancelled successfully.",
    });
  } catch (error) {
    res.status(501).send({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const getUserOrder = async (req, res) => {
  try {
    const orders = await orderModel.find({ user: req.userData._id });
    return res.status(200).send({
      success: true,
      message: "Orders fetched successfully.",
      orderCount: orders.length || 0,
      orders,
    });
  } catch (error) {
    res.status(501).send({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const reNewOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { duration } = req.body;
    const order = await orderModel.findById(orderId).populate("product");
    if (!order) {
      res.status(400).send({
        success: false,
        message: "Order not found.",
      });
    }
    if (order.user !== req.userData._id) {
      res.status(400).send({
        success: false,
        message: "Unauthorized access.",
      });
    }
    // check duration is valid
    const numberDuration = getNumberDuration(duration);
    if (!numberDuration) {
      return res.send({
        success: false,
        message: "Please select valid duration.",
      });
    }
    // get rental rate
    const subcategory = await productModel
      .findById(order.product)
      .select("subcategory")
      .populate("subcategory");

    // initiating a payment order
    const percantage = parseFloat(subcategory[duration]); // duration percentage
    const amount = parseInt((parseInt(order.product.price) * percantage) / 100);
    const deliveryCharge = getDeliveryCharge(
      order.product.weight,
      order.product.length,
      order.product.widhth,
      order.product.height
    );
    const paymentOrder = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        productId,
        userId: req.userData._id,
        deliveryCharge,
      },
    };
    const { id: paymentOrderId } = await createRazorpayOrder(paymentOrder);
    // updating order
    order.price.push(amount);
    order.duration.push(getNumberDuration(duration));
    order.paymentOrderId.push(paymentOrderId);
    order.isPaid = false;
    await order.save();
    return res.status(200).send({
      success: true,
      message: "Renewal requested successfully.",
      paymentOrderId,
      amount,
    });
  } catch (error) {
    res.status(501).send({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const undeliveredOrder = async (req, res) => {
  try {
    const { pincode: deliverymanPincode } = req.userData.address;
    const now = new Date();

    const pendingOrders = await orderModel.find({
      productPincode: deliverymanPincode,
      $or: [
        { orderStatus: "confirmed", shipingDate: { $exists: false } },
        { orderStatus: "cancelled", returnDate: null },
        { rentPlanEndDate: { $lt: now }, orderStatus: { $ne: "returned" } }
      ]
    });

    if (!pendingOrders || pendingOrders.length === 0) {
      return res.status(400).send({
        success: false,
        message: "There is no order in your location.",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Order fetched successfully",
      count: pendingOrders.length,
      pendingOrders,
    });
  } catch (error) {
    res.status(501).send({
      success: false,
      message: "Something went wrong.",
      error: error.message,
    });
  }
};
