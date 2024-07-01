import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import deviceDetector from "../services/deviceDetector.js";

// Autherization function
const isAuth = async (req, res, next) => {
  const userClient = req.headers["user-agent"] || "";
  const isBrowser = deviceDetector(userClient);
  let token = undefined;
  if (isBrowser) {
    token = req.cookies?.token;
  } else {
    if(!req.headers.authorization){
      return res.status(401).send({
        succcess: false,
        message: "Unauthorized access",
      });
    }
    token = req?.headers?.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).send({
      succcess: false,
      message: "Unauthorized access! please login again.",
    });
  }
  JWT.verify(token, process.env.JWT_SECRET, async (error, userId) => {
    if (error) {
      return res.status(401)
        .send({
          succcess: false,
          message: "Please log in or register to continue.",
        });
    } else {
      try {
        const userData = await userModel.findById(userId.id);
        if (!userData) {
          return res
            .status(401)
            .send({
              succcess: false,
              message: "User doesn't exists.",
            });
        }
        req.userData = userData;
        next(); 
      } catch (error) {
        return res.status(401).send({
            succcess: false,
            message: "Error in Auth API.",
          });
      }
    }
  });
};

export default isAuth;
