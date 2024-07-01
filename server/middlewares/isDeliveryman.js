import userModel from "../models/userModel.js"

export const isDeliveryman=async (req,res,next)=>{
    if(!req.userData || !req.userData.role || req.userData.role!=='deliveryman'){
        return res.status(400).send({
            success:false,
            message:'The role should be deliveryman.'
        })
    }
    else{
        return next();
    }
}

export default isDeliveryman;