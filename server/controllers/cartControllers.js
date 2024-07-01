import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if the product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(400).send({
        success: false,
        message: "Product not found.",
      });
    }

    const userId = req.userData._id;
    let cart = await cartModel.findOne({ user: userId });

    if (cart) {
      // Avoid duplicate product entries
      if (!cart.cartItems.includes(productId)) {
        cart.cartItems.push(productId);
        await cart.save();
      }
    } else {
      cart = await cartModel.create({
        user: userId,
        cartItems: [productId],
      });
    }
    return res.status(200).send({
      success: true,
      message: "Product added to new cart.",
      itemCount: cart.cartItems.length,
      cart: cart.cartItems,
    });
  } catch (error) {
    return res.status(501).send({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userData._id;

    const cart = await cartModel.findOneAndUpdate(
      { user: userId },
      { $pull: { cartItems: productId } },
      { new: true }
    );

    if (!cart) {
      return res.status(400).send({
        success: false,
        message: "Cart not found.",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Product removed from cart.",
      itemCount: cart.cartItems.length,
      cart: cart.cartItems,
    });
  } catch (error) {
    return res.status(501).send({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const getCartItems = async (req, res) => {
  try {
    const userId = req.userData._id;
    const cart = await cartModel.findOne({ user: userId });

    if (!cart || cart.cartItems.length === 0) {
      return res.status(200).send({
        success: true,
        message: "Cart is empty.",
        cartItems: [],
      });
    }

    const populatedItems = await productModel.find({
      _id: { $in: cart.cartItems },
    });

    return res.status(200).send({
      success: true,
      message: "Cart items fetched successfully.",
      itemCount: populatedItems.length,
      cartItems: populatedItems,
    });
  } catch (error) {
    return res.status(501).send({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.userData._id;
    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(400).send({
        success: false,
        message: "Cart not found.",
      });
    }

    cart.cartItems = [];
    await cart.save();

    return res.status(200).send({
      success: true,
      message: "Cart cleared successfully.",
      cart: [],
    });
  } catch (error) {
    return res.status(501).send({
      success: false,
      message: "Something went wrong.",
    });
  }
};
