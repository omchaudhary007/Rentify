import categoryModel from "../models/categoryModel.js";
import {
  deleteFromCloudinary,
  uploadFileToCloudinary,
} from "../services/cloudinaryServices.js";

export const createCategoryController = async (req, res) => {
  const { categoryName } = req.body;
  if (!categoryName) {
    return res.status(404).send({
      success: false,
      message: "Please provide category name.",
    });
  }
  if (!req.file || !req.file.buffer) {
    return res.status(500).send({
      success: false,
      message: "Please provide category image.",
    });
  }

  // uploading category image
  uploadFileToCloudinary(req.file.buffer, "categoryImage", "categoryPic")
    .then(async (result) => {
      const categoryImg = {
        public_id: result.public_id,
        url: result.secure_url,
      };
      const newCategory = await categoryModel.create({
        categoryName,
        categoryImg,
      });
      if (!newCategory) {
        return res.status(400).send({
          success: false,
          message: `Failed to ${categoryName} category.`,
        });
      }
      return res.status(200).send({
        success: true,
        message: `${categoryName} is created successfully`,
        category: newCategory,
      });
    })
    .catch((error) => {
      if (error.code === 11000) {
        return res.status(400).send({
          success: false,
          message: `${categoryName} already exists.`,
        });
      }
      return res.status(500).send({
        success: false,
        message: "Failed to create new category.",
      });
    });
};

export const getCategoryController = async (req, res) => {
  try {
    let pagesize = isNaN(req?.query?.pagesize);
    pagesize = pagesize ? 10 : parseInt(req.query.pagesize);
    const Categories = await categoryModel.find().limit(pagesize);
    if (!Categories) {
      return res.status(400).send({
        success: false,
        message: "No categories found.",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Categories retrieved successfully.",
      Categories,
    });
  } catch (error) {
    return res.status(500).send({
      success: true,
      message: "Failed to retrieve categories.",
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    let { categoryName, newCategoryName } = req.body;
    if (!categoryName) {
      return res.status(404).send({
        success: false,
        message: "Please provide category name.",
      });
    }
    categoryName = categoryName.toLowerCase();
    let updatedCategory = await categoryModel.findOne({ categoryName });
    if (!updatedCategory) {
      return res.status(400).send({
        success: false,
        message: "Category not found.",
      });
    }
    if (req.file && req.file.buffer) {
      // deleting old images
      deleteFromCloudinary(updatedCategory.categoryImg.public_id);

      // uploading new images
      const result = await uploadFileToCloudinary(
        req.file.buffer,
        "categoryImage",
        "categoryPic"
      );
      updatedCategory.categoryImg = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }
    
    updatedCategory.categoryName = newCategoryName || categoryName;
    await updatedCategory.save();
    return res.status(200).send({
      success: true,
      message: `${categoryName} updated successfully`,
      category: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in update-category API.",
    });
  }
};
