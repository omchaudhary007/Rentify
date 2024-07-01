import express from "express";
import isAuth from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
  createSubcategory,
  getAllSubcategory,
  getSubcategory,
  updateSubcategory,
} from "../controllers/subcategoryControllers.js";

const router = express.Router();

router.post("/create", isAuth, isAdmin, createSubcategory);
router.get('/all-subcategories',getAllSubcategory);
router.get('/:id',getSubcategory);
router.post("/update", isAuth, isAdmin, updateSubcategory);


export default router;
