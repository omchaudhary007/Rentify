import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique:true,
      lowercase:true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      minlength:[6,'Minimum length should be 6.'],
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["user","deliveryman","admin"],
      default: "user",
    },
    isVerified:{  
      type:Boolean,
      default:false, // verification for deliveryman
    },
    address: {
      lng:{
        type:Number,
      },
      lat:{
        type:Number,
      },
      landmark: {
        type: String,
        lowercase: true,
        trim: true,
      },
      placeName: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, "Place name is required"],
      },
      postalcode: {
        type: String,
        required: [true, "Postal code is required"],
      },
      city: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, "City name is required"],
      },
      state: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, "State name is required"],
      },
      country: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, "Country name is required"],
      },
    },
    profilePic: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
  },
  { timestamps: true }
);

// Middleware to hash password before saving 
userSchema.pre("save", async function (next) { 
  try {
    if (this.isModified("password")){
      this.password =await bcrypt.hash(this.password, 12);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateToken = function () {
  return JWT.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const userModel = mongoose.model("User", userSchema);
export default userModel;
