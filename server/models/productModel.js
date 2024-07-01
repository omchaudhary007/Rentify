import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    productname: {
      type: String,
      minlength:2,
      trim:true,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
    brand: {
      type: String,
      lowercase: true,
    },
    weight:{
      type:Number,
      required:[true,"Weight is required"]
    },
    length:{
      type:Number,
      required:[true,"Length is required"]
    },
    width:{
      type:Number,
      required:[true,"Width is required"]
    },
    height:{
      type:Number,
      required:[true,"Height is required"]
    },
    attributes: [
      {
        key: {
          type: String,
          lowercase: true,
          trim: true,
        },
        value: {
          type: String,
          lowercase: true,
          trim: true,
        },
        _id:false
      },
    ],
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required:[true,"Subcategory is required"]
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:[true,'Owner id id is required']
    },
    outofStock: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
  },
  { timeStamps: true }
);

const productModel = mongoose.model("Products", productSchema);
export default productModel;
