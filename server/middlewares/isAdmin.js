import userModel from "../models/userModel.js"

export const isAdmin=async (req,res,next)=>{
    if(!req.userData || !req.userData.role || req.userData.role!=='admin'){
        return res.status(400).send({
            success:false,
            message:'User must be admin.'
        })
    }
    else{
        next();
    }
}

export default isAdmin;