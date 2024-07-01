import reviewModel from "../models/reviewModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

export const addReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId, rating, comment, images } = req.body;
    const userId = req.user._id;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .send({ success: false, message: "Order not found" });
    }
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }
    const existingReview = await reviewModel.findOne({
      user: userId,
      product: productId,
    });
    if (existingReview) {
      return res
        .status(400)
        .send({ success: false, message: "You already reviewed this product" });
    }
    const review = await reviewModel.create({
      product: productId,
      user: userId,
      rating,
      comment,
      images,
    });
    await productModel.findByIdAndUpdate(productId, {
      $push: { reviews: review._id },
    });
    return res.status(201).send({ success: true, review });
  } catch (error) {
    return res
      .status(501)
      .send({ success: false, message: "Something went wrong!" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.user._id;
    const review = await reviewModel.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res
        .status(404)
        .send({ success: false, message: "Review not found" });
    }
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.images = images || review.images;
    await review.save();
    return res.status(200).send({ success: true, review });
  } catch (error) {
    return res
      .status(501)
      .send({ success: false, message: "Something went wrong!" });
  }
};

export const getReviewByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await reviewModel
      .find({ product: productId })
      .populate("user", "name email");
    return res.status(200).send({ success: true, reviews });
  } catch (error) {
    return res
      .status(501)
      .send({ success: false, message: "Something went wrong!" });
  }
};

export const getReviewByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const reviews = await reviewModel
      .find({ user: userId })
      .populate("product", "name price");
    return res.status(200).send({ success: true, reviews });
  } catch (error) {
    return res
      .status(501)
      .send({ success: false, message: "Something went wrong!" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const review = await reviewModel.findOneAndDelete({
      _id: reviewId,
      user: userId,
    });
    if (!review) {
      return res
        .status(404)
        .send({ success: false, message: "Review not found" });
    }
    await productModel.findByIdAndUpdate(review.product, {
      $pull: { reviews: review._id },
    });
    return res
      .status(200)
      .send({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    return res
      .status(501)
      .send({ success: false, message: "Something went wrong!" });
  }
};
