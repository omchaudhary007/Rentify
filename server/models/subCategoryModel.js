import mongoose from "mongoose";

const subCategorySchema = mongoose.Schema({
    subcategoryName: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Sub-category name is required"],
      lowercase: true,
    },
    category:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Category',
      default:null,
    },
    monthPercent:{
      type:Number,
      default:7
    },
    threeMonthPercent:{
      type:Number,
      default:15
    },
    sixMonthPercent:{
      type:Number,
      default:30
    },
    oneYearPercent:{
      type:Number,
      default:50
    },
    twoYearPercent:{
      type:Number,
      default:70
    }
  },
{ timeStamps: true });

const subcategoryModel = mongoose.model("Subcategory", subCategorySchema);
export default subcategoryModel;
