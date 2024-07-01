import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    categoryName: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Category is required"],
      lowercase: true,
    },
    categoryImg: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
    },
  },
{ timeStamps: true });

const categoryModel = mongoose.model("Category", categorySchema);
export default categoryModel;
