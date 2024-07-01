import userModel from "../models/userModel.js";
import { addressValidator } from "../services/addressServices.js";
import deviceDetector from "../services/deviceDetector.js";
import {
  uploadFileToCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinaryServices.js";
import {
  validateName,
  validateEmail,
  validatePasswordLength,
  validatePhone,
} from "../services/validatorMethods.js";
import otpModel from "../models/otpModel.js";
import sendmail from "../services/mailService.js";
import emailTemplates from "../data/emailTemplates.js";
import isAuth from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdmin.js";

export const createUser = async (req, res, next) => {
  try {
    let {
      name,
      email,
      password,
      role,
      landmark,
      placeName,
      postalcode,
      city,
      state,
      country,
      phone,
    } = req.body;

    // extracating only required keys
    let address = {
      landmark,
      placeName,
      postalcode,
      city,
      state,
      country,
    };

   // role-validation
    if (!role || (role != "user" && role != "deliveryman")) {
      return res.status(400).send({
        success: false,
        message: "Role is invalid!",
      });
    }
    if (
      !name ||
      !email ||
      !password ||
      !address ||
      !phone ||
      !validateName(name) ||
      !validateEmail(email) ||
      !validatePasswordLength(password) ||
      !validatePhone(phone)
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required in valid format.",
      });
    }
    email = email.toLowerCase();

    // address verification using address api
    const isvalidAddress = await addressValidator(address);
    if (isvalidAddress?.name === "Error") {
      return res.status(500).send({
        success: false,
        message: "Unable to verify address",
      });
    }
    if (!isvalidAddress.success) {
      return res.status(400).send(isvalidAddress);
    }
    // setting longitude and latitude after verification
    address.lng= isvalidAddress.lng;
    address.lat= isvalidAddress.lat;

    // checking and deleting otp-verified email
    const deleteVerified = await otpModel.deleteOne({
      email,
      isVerified: true,
    });
    if (!deleteVerified.deletedCount) {
      return res.status(400).send({
        success: false,
        message: "Email is not verified.",
      });
    }

    // creating a user
    let user = await userModel.create({
      name,
      email,
      password,
      role: role.toLowerCase(),
      address,
      phone,
    });
    user.password = undefined;
    sendmail(
      email,
      "Welcome to Rentify - We're Excited to Have You!",
      emailTemplates.welcomeEmail(name.split(" ")[0])
    );

    // sending mail to admin for deliveryman verification
    if (user.role == "deliveryman") {
      const deliveryManCount = await userModel.countDocuments({
        role: "deliveryman",
      });
      sendmail(
        "omchaudhary0730@gmail.com",
        "Pending Deliveryman Verifications :Please Review",
        emailTemplates.deliverymanVerification(deliveryManCount)
      );
    }
    return res.status(200).send({
      success: true,
      message: "User registration successful.",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({
        success: false,
        message: "Email already exists.",
      });
    }
    return res.status(500).send({
      success: false,
      message: "Error in create API.",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Email and password are required",
      });
    }
    email = email.toLowerCase();
    const userData = await userModel.findOne({ email });
    if (!userData) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }
    const isPasswordValid = await userData.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(404).send({
        success: false,
        message: "Incorrect Password.",
      });
    }

    // Token creation and using cookie for browser only
    const token = await userData.generateToken();
    const userClient = req.headers["user-agent"] || "";
    const isBrowser = deviceDetector(userClient);

    if (isBrowser) {
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // for 30days
        path: "/",
      });
    } else {
      res.setHeader("Authorization", `Bearer ${token}`);
    }
    res.status(200).send({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    res.status(401).send({
      success: false,
      message: "Error in login API.",
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    const userClient = req.headers["user-agent"] || "";
    const isBrowser = deviceDetector(userClient);

    if (isBrowser) {
      res.cookie("token", "", {
        expires: new Date(0),
      });
    } else {
      res.removeHeader("Authorization");
    }

    return res.status(200).send({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error. Logout failed!",
    });
  }
};

export const getUserProfileController = async (req, res) => {
  if (!req.userData) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
  // sending userData after removing password field
  req.userData.password = undefined;
  return res.status(200).send({
    success: true,
    user: req.userData,
  });
};

export const updateProfileController = async (req, res) => {
  try {
    const {
      name,
      landmark,
      placeName,
      postalcode,
      city,
      state,
      country,
      phone,
    } = req.body;
    const notAddress =
      !landmark && !placeName && !postalcode && !city && !state && !country;

    if (notAddress && !name && !phone) {
      return res.status(400).send({
        success: false,
        message: "At least one field should be there.",
      });
    }

    if (!req.userData) {
      return res.status(400).send({
        success: false,
        message: "Something went wrong.",
      });
    }
    // validating provided fields
    if (name && !validateName(name)) {
      return res.status(400).send({
        success: false,
        message: "Invalid name format",
      });
    }
    if (phone && !validatePhone(phone)) {
      return res.status(400).send({
        success: false,
        message: "Invalid phone number format",
      });
    }
    const currentAddress = req.userData.address;
    let address = {
      landmark: landmark ?? currentAddress.landmark,
      placeName: placeName ?? currentAddress.placeName,
      postalcode: postalcode ?? currentAddress.postalcode,
      city: city ?? currentAddress.city,
      state: state ?? currentAddress.state,
      country: country ?? currentAddress.country,
    };

    // validating address if present
    if (!notAddress) {
      const isvalidAddress = await addressValidator(address);
      if (isvalidAddress?.name === "Error") {
        return res.status(500).send({
          success: false,
          message: "Something went wrong while address verification",
        });
      }
      if (!isvalidAddress.success) {
        return res.status(400).send(isvalidAddress);
      }
      address.lng= isvalidAddress.lng;
      address.lat= isvalidAddress.lat;
    }

    const updatedUser = {
      name: name || req.userData.name,
      address,
      phone: phone || req.userData.phone,
    };

    const userData = await userModel.findByIdAndUpdate(
      req.userData._id,
      { $set: updatedUser },
      { new: true }
    );
    userData.password = undefined; // making hashed password undefined to hide internal working
    return res.status(200).send({
      success: true,
      message: "Update successful",
      user: userData,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in update API.",
    });
  }
};

export const updateProfilePicController = (req, res) => {
  if (!req.userData || !req.file || !req.file.buffer) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
  const user = req.userData;

  // deleting old profile photo asynchronously
  if (user.profilePic && user.profilePic.public_id) {
    deleteFromCloudinary(user.profilePic.public_id);
  }

  // uploading new profile-photo asynchronously
  uploadFileToCloudinary(req.file.buffer, "ProfilePicture", "profilePic")
    .then(async (result) => {
      // update profilePic in db
      user.profilePic = {
        public_id: result.public_id,
        url: result.secure_url,
      };

      // saving in db
      await user.save();
      res.status(200).send({
        success: true,
        message: "Profile picture updated successfully",
        profilePic: user.profilePic,
      });
    })
    .catch((error) => {
      res.status(500).send({
        success: false,
        message: "Failed to upload Image.",
      });
    });
};

export const changepasswordController = async (req, res) => {
  try {
    const { oldpassword, newpassword } = req.body;
    if (!oldpassword || !newpassword || !validatePasswordLength(newpassword)) {
      return res.status(400).send({
        success: false,
        message: "Please provide old and new passwords in valid format.",
      });
    }

    if (!req.userData) {
      return res.status(500).send({
        success: false,
        message: "Internal server error",
      });
    }
    // checking and deleting otp-verified email
    const deleteVerified = await otpModel.deleteOne({
      email: req.userData.email,
      isVerified: true,
    });
    if (!deleteVerified.deletedCount) {
      return res.status(400).send({
        success: false,
        message: "Email is not verified.",
      });
    }

    const isMatched = await req.userData.comparePassword(oldpassword);
    if (!isMatched) {
      return res.status(400).send({
        success: false,
        message: "Password is incorrect",
      });
    }
    req.userData.password = newpassword;
    await req.userData.save();
    res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Failed to update password.",
    });
  }
};

export const changeEmailController = async (req, res) => {
  try {
    let { newemail } = req.body;
    if (!req.userData) {
      return res.status(500).send({
        success: false,
        message: "Internal server error",
      });
    }
    if (!newemail || !validateEmail(newemail)) {
      return res.status(400).send({
        success: false,
        message: "Please provide new valid email.",
      });
    }
    newemail = newemail.toLowerCase();
    const deleteVerified = await otpModel.deleteOne({
      email: newemail,
      isVerified: true,
    });
    if (!deleteVerified.deletedCount) {
      return res.status(400).send({
        success: false,
        message: "Email is not verified.",
      });
    }
    const updatedEmail = await userModel.findByIdAndUpdate(
      { _id: req.userData._id },
      { $set: { email: newemail } },
      { new: true }
    );
    if (!updatedEmail) {
      return res.status(400).send({
        success: false,
        message: "Failed to update email.",
      });
    }
    updatedEmail.password = undefined;
    return res.status(200).send({
      success: true,
      message: "Email updation successful",
      user: updatedEmail,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in email update api.",
    });
  }
};
export const passwordResetController = async (req, res) => {
  try {
    let { newpassword } = req.body;
    if (!req.userData) {
      return res.status(500).send({
        success: false,
        message: "Internal server error",
      });
    }
    if (!newpassword || !validatePasswordLength(newpassword)) {
      return res.status(400).send({
        success: false,
        message: "Please provide valid new password.",
      });
    }

    const deleteVerified = await otpModel.deleteOne({
      email: req.userData.email,
      isVerified: true,
    });
    if (!deleteVerified.deletedCount) {
      return res.status(400).send({
        success: false,
        message: "Email is not verified.",
      });
    }

    // updating password
    req.userData.password = newpassword;
    await req.userData.save();
    return res.status(200).send({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in password reset API.",
    });
  }
};

export const deleteAccountController = async (req, res) => {
  try {
    if (!req.userData) {
      return res.status(500).send({
        success: false,
        message: "Internal server error",
      });
    }

    // checking and deleting otp-verified email
    const deleteVerified = await otpModel.deleteOne({
      email: req.userData.email,
      isVerified: true,
    });
    if (!deleteVerified.deletedCount) {
      return res.status(400).send({
        success: false,
        message: "Email is not verified.",
      });
    }
    const deletedUser = await userModel.findByIdAndDelete(req.userData._id);
    if (deletedUser) {
      deletedUser.password = undefined;
      return res.status(200).send({
        success: true,
        message: "User deleted successfully",
        User: deletedUser,
      });
    } else {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Failed to delete User.",
    });
  }
};
