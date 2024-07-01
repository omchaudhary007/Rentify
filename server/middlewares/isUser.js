import userModel from "../models/userModel.js"

export const isUser=async (req,res,next)=>{
    if(!req.userData || !req.userData.role || req.userData.role!=='user'){
        return res.status(400).send({
            success:false,
            message:'The role should be user.'
        })
    }
    else{
        return next();
    }
}

export default isUser;