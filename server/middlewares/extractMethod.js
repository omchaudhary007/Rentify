const extractMethod = (req, res, next) => {
  try {
    let method = req?.query?._method;
    if (method) method = method.toUpperCase();
    if (method === "PUT" || method === "PATCH" || method === "DELETE") {
      req.method = method;
    }
    next();
  } catch (error) {
    res.send({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export default extractMethod;
