import mongoose from "mongoose";

const otpSchema= mongoose.Schema({
    email:{
        type:String,
        unique:true,
        lowercase:true,
        required:[true,'Email is required']
    },
    otp:{
        type:String,
        required:[true,'OTP is required']
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    expiresAt:{
        type:Date,
        required:[true,'OTP expire time is required.']
    },
});


const otpModel= mongoose.model('Otp',otpSchema);
export default otpModel;