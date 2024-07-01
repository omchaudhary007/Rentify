import crypto from "crypto";
import sendmail from "./mailService.js";
import otpModel from "../models/otpModel.js";
import emailTemplates from "../data/emailTemplates.js";
import { validateEmail } from "./validatorMethods.js";

export const generateOtp = () => crypto.randomInt(100000, 999999);

export const requestOtp = async (req, res) => {
  try {
    let { email } = req.body;
    email=email.toLowerCase();
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }
    if(!validateEmail(email)){
      return res.status(400).send({
        success: false,
        message: "Email is not valid.",
      });
    }
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + (2 * 60+5) * 1000); // otp verification time 2 minute and 5 second.

    // deleting old and creating new data if otp expired
    const isExists = await otpModel.findOne({ email });
    if (isExists) {
      if(new Date>isExists.expiresAt)
      await otpModel.deleteOne({email});
      else
      return res.status(200).send({
        success: true,
        message: "OTP already sent to your email.",
      });
    }
    const otpDocuement = await otpModel.create({ email, otp, expiresAt });
    if (!otpDocuement) {
      return res.status(500).send({
        success: false,
        message: "Failed to generate OTP.",
      });
    }

    // sending otp as mail
    const mail=await sendmail(email, 'Rentify Verification Code',emailTemplates.otpVerification(otp));
    if(!mail.success){
      return res.status(400).send({
        success: false,
        message: "Failed to send OTP.",
      });
    }
    return res.status(200).send({
      success: true,
      message: "OTP sent. Expires in 2 mins.",
    });
  } catch (error) {
    console.log("error is: ",error)
    return res.status(500).send({
      success: false,
      message: "Failed to generate OTP.",
    });
  }
};

export const verifyOtp = async (req, res,next) => {
  try {
    let { email, otp } = req.body;
    email=email.toLowerCase();
    // Validate if email and OTP are present
    if (!email || !otp) {
      return res.status(400).send({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    // verifying availbility
    const otpRecord = await otpModel.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).send({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Check if OTP has expired 
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).send({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }
    // marking verified true if valid otp
    otpRecord.isVerified=true;
    await otpRecord.save();
    return res.status(200).send({
      success:true,
      message:'Otp verified successfully'
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Failed to verify OTP.",
    });
  }
};
