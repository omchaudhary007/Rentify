import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "user id is required"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
    productPincode:{
      type:String,
      required:[true,'Product pincode is required.']
    },
    price: [
      {
        type: Number,
        required: [true, "Product price is required"],
      },
    ],
    deliveryCharge: {
      type: Number,
      default: 100,
    },
    duration: [
      {
        type: Number,
        required: [true, "Rent duration is required"],
      },
    ],
    orderStatus: {
      type: String,
      enum: ["confirmed", "shipped", "delivered", "cancelled", "returned"],
      default: "confirmed",
    },
    paymentOrderId: [
      {
        type: String,
        required: [true, "paymentId is required."],
      },
    ],
    isPaid: {
      type: Boolean,
      default: false,
    }, 
    isRefunded: {
      type: Boolean, // only for cancelled orders
      default: true,              
    },
    confirmationDate: Date,
    shippingDate:Date,
    deliveryDate: Date,
    cancelDate: Date,
    returnDate: Date,
    rentPlanEndDate: Date,
  },
  { timestamps: true }
);

const orderModel = mongoose.model("Orders", orderSchema);
export default orderModel;
