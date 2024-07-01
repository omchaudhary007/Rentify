import categoryModel from "../models/categoryModel.js";
import subcategoryModel from "../models/subCategoryModel.js";

export const createSubcategory = async (req, res) => {
  const {
    subcategory,
    category,
    weekPercent,
    monthPercent,
    threeMonthPercent,
    sixMonthPercent,
    oneYearPercent,
    twoYearPercent,
  } = req.body;

  try {
    if (!subcategory || !category) {
      return res.status(400).send({
        success: false,
        message: "Subcategory and category name is required",
      });
    }

    const isCategory = await categoryModel.findOne({
      categoryName: category.toLowerCase(),
    });
    if (!isCategory) {
      return res.status(400).send({
        success: false,
        message: `${category} category doesn't exists.`,
      });
    }

    const newSubcategory = await subcategoryModel.create({
      subcategoryName: subcategory,
      category: isCategory._id,
      weekPercent,
      monthPercent,
      threeMonthPercent,
      sixMonthPercent,
      oneYearPercent,
      twoYearPercent,
    });
    return res.status(200).send({
      success: true,
      message: `${subcategory} subcategory created successfully`,
      newSubcategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({
        success: false,
        message: `${subcategory} already exists.`,
      });
    }
    return res.status(500).send({
      success: false,
      message: "Error in subcategory create API",
    });
  }
};

export const getAllSubcategory = async (req, res) => {
  try {
    let pagesize = isNaN(req?.query?.pagesize);
    pagesize = pagesize ? 10 : parseInt(req.query.pagesize);
    const subCategory = await subcategoryModel.find().limit(pagesize);
    return res.status(200).send({
      success: true,
      message: "Subcategories fetched successfully",
      subCategory,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in getAll subcategory API",
    });
  }
};

export const getSubcategory = async (req, res) => {
  try {
    const subcategories = await subcategoryModel.find({ category: req.params.id });
    return res.status(200).send({
      success: true,
      message: "Subcatagories fetched successfully.",
      size:subcategories?.length,
      subcategories,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in getAll subcategory API",
    });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const {
      subcategory,
      newSubcategory,
      category,
      weekPercent,
      monthPercent,
      threeMonthPercent,
      sixMonthPercent,
      oneYearPercent,
      twoYearPercent,
    } = req.body;
    if (!subcategory || !newSubcategory) {
      return res.status(400).send({
        success: false,
        message: "Old and new name of subcategory is required",
      });
    }

    // category-verification
    let isCategory;
    if (category) {
      isCategory = await categoryModel.findOne({
        categoryName: category.toLowerCase(),
      });
      if (!isCategory) {
        return res.status(400).send({
          success: false,
          message: `${category} category doesn't exists.`,
        });
      }
    }
    const Subcategory = await subcategoryModel.findOneAndUpdate(
      { subcategoryName: subcategory.toLowerCase() },
      {
        $set: {
          subcategoryName: newSubcategory,
          category: isCategory?._id,
          weekPercent,
          monthPercent,
          threeMonthPercent,
          sixMonthPercent,
          oneYearPercent,
          twoYearPercent,
        },
      },
      { new: true }
    );
    if (!Subcategory) {
      return res.status(400).send({
        success: false,
        message: `${subcategory} subcategory doesn't exists`,
      });
    }
    return res.status(200).send({
      success: true,
      message: `${subcategory} subcategory updated successfully`,
      Subcategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({
        success: false,
        message: `${subcategory} already exists.`,
      });
    }
    return res.status(500).send({
      success: false,
      message: "Error in subcategory update API",
    });
  }
};
