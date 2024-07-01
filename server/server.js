import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import connectDB from "./config/dbConnect.js";
import extractMethod from "./middlewares/extractMethod.js";
import { requestOtp, verifyOtp } from "./services/otpServices.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import otpModel from "./models/otpModel.js";
import cartRoutes from "./routes/cartRoutes.js";
import { CronJob } from "cron";
import { getAddressbyPincode } from "./services/addressServices.js";

//database connection
connectDB(process.env.MONGO_URL);

// cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// server creation
const app = express();
const PORT = process.env.PORT || 999;

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(extractMethod); // to extract method specially for form-type

app.post("/otp/request", requestOtp);
app.post("/otp/verify", verifyOtp);
app.get("/postal-addresses/:postalCode", async (req, res) => {
  try {
    const { postalCode } = req.params;
    const response = await getAddressbyPincode(postalCode);
    if (!response.success) {
      return res.status(400).send(response);
    } else return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Something went wrong.",
    });
  }
});
app.use("/user", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/subcategories", subcategoryRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/carts", cartRoutes);

app.use("*", (req, res) => {
  res.status(404).send({
    success: false,
    message: "Page Not Exists!",
  });
});

// Runs every day at 12:00 AM to clean otp-model
const job = new CronJob(
  "0 0 * * *",
  async function () {
    try {
      // Get the current time minus 10 minutes
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      // Delete records where expiresAt + 10 minutes has already passed
      const result = await otpModel.deleteMany({
        expiresAt: { $lte: tenMinutesAgo },
      });
    } catch (error) {
      console.log(`Cron Job Failed: ${error.message}`);
    }
  },
  null, // onComplete function
  true, // Auto-start the job
  "Asia/Kolkata"
);

app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server is running on Port ${PORT}`);
  } else console.log("Error while starting server.");
});
