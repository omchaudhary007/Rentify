import productModel from "../models/productModel.js";
import subcategoryModel from "../models/subCategoryModel.js";
import {
  uploadFileToCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinaryServices.js";

export const createProduct = async (req, res) => {
  const images = [];
  const files = req.files;
  let imageNumber = 1;
  let errorFile = undefined;
  let { productname, description, price, brand, attributes, subcategory } =
    req.body;
  if (
    !productname ||
    !description ||
    !price ||
    !subcategory ||
    !weight ||
    !length ||
    !width ||
    !height
  ) {
    return res.status(400).send({
      success: false,
      message: "Please provide all required fields",
    });
  }
  try {
    if (
      productname.length > 100 ||
      brand.length > 50 ||
      description.length > 1000 ||
      attributes.length > 10
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Maximum size of name,brand,description and attributes is 100,50,1000 and 10.",
      });
    }

    // if price is not number
    if (isNaN(price)) {
      return res.status(400).send({
        success: false,
        message: "Price value is invalid.",
      });
    }
    // if image is missing
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Product Images is required.",
      });
    }

    // verifaying subcategory
    subcategory = subcategory.toLowerCase();
    const isSubcategory = await subcategoryModel.findOne({
      subcategoryName: subcategory,
    });
    if (!isSubcategory) {
      return res.status(400).send({
        success: false,
        message: `${subcategory} subcategory doesn't exists`,
      });
    }

    // uploading product images

    for (let file of files) {
      try {
        const result = await uploadFileToCloudinary(
          file.buffer,
          "ProductImage",
          "product"
        );
        images.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      } catch (uploadError) {
        // If zero photo uploaded then product will not get created
        if (imageNumber == 1) {
          return res.status(500).send({
            success: false,
            message: `Failed to upload file ${imageNumber} named (${file.originalname}).`,
          });
        }
        errorFile = file;
        break;
      }
      imageNumber += 1;
    }

    const newProduct = await productModel.create({
      productname,
      description,
      price,
      brand,
      length,
      height,
      width,
      weight,
      attributes,
      subcategory: isSubcategory._id,
      owner: req.userData._id,
      images,
    });

    // sending error image details
    if (errorFile) {
      return res.status(500).send({
        success: false,
        message: `Failed to upload file ${imageNumber} (${errorFile.originalname}).`,
      });
    }
    return res.status(200).send({
      success: true,
      message: "Product created successfully",
      newProduct,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in create product API",
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    let { pageno, pageSize } = req.query;
    pageno = !pageno || pageno <= 0 ? 1 : pageno;
    pageSize = !pageSize || pageSize <= 0 ? 10 : pageSize;

    // if numbers are invalid
    if (isNaN(pageno) || isNaN(pageSize)) {
      return res.status(400).send({
        success: false,
        message: "Invalid page values.",
      });
    }
    // send product by excluding owner detailes.
    const products = await productModel
      .find(
        {},
        {
          owner: 0,
        }
      )
      .skip((pageno - 1) * pageSize)
      .limit(pageSize);
    return res.status(200).send({
      success: true,
      message: "Product fetched successfully",
      length: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in getProducts API",
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Product not found",
      });
    }
    let product = await productModel.findOne(
      {
        _id: req?.params?.id,
      },
      {
        owner: 0,
      }
    );
    if (!product) {
      return res.status(400).send({
        success: false,
        message: "Product not found.",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Product found successfully",
      product,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in getProduct API",
    });
  }
};

export const updateProduct = async (req, res) => {
  let errorFile = undefined;
  let imagesToKeep = [];
  let message = "Product updated successfully";

  try {
    let {
      productname,
      description,
      price,
      brand,
      length,
      width,
      height,
      weight,
      attributes,
      subcategory,
      deleteImages = [],
    } = req.body;
    if (
      (productname && productname.length > 100) ||
      (brand && brand.length > 50) ||
      (description && description.length > 1000) ||
      (attributes && attributes.length > 10)
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Maximum size of name,brand,description and attributes is 100,50,1000 and 10.",
      });
    }

    // if price is not number
    if (price && isNaN(price)) {
      return res.status(400).send({
        success: false,
        message: "Price value is invalid.",
      });
    }

    let product = await productModel.findOne({
      _id: req.params.id,
    });
    if (!product) {
      return res.status(400).send({
        success: false,
        message: "Product doesn't exists",
      });
    }
    // ensure user is owner
    if (product.owner !== req.userData._id) {
      return res.send({
        success: false,
        message: "You are not autherized to update this product.",
      });
    }
    // verifaying subcategory if present
    let isSubcategory;
    if (subcategory) {
      subcategory = subcategory.toLowerCase();
      isSubcategory = await subcategoryModel.findOne({
        subcategoryName: subcategory,
      });
      if (!isSubcategory) {
        return res.status(400).send({
          success: false,
          message: `${subcategory} subcategory doesn't exists`,
        });
      }
    }

    // image changes only when provided
    if (req.files || deleteImages.length) {
      let newFileLength = !req.files ? 0 : req.files.length;
      if (deleteImages.length > 5 || newFileLength.length > 5) {
        return res.status(400).send({
          success: false,
          message: "The image limit is 5.",
        });
      }

      // Ensure maximum image be less<=5
      let isLimited =
        product.images.length - deleteImages.length + newFileLength;
      isLimited = isLimited > 0 && isLimited <= 5;
      if (!isLimited) {
        return res.status(400).send({
          success: false,
          message:
            "The maximum number of product images allowed is 5, and the minimum should be 1.",
        });
      }

      // Deleting images that are in the delete list
      const ValidDelete = product.images.length - deleteImages.length;
      for (let img in product.images) {
        if (deleteImages.includes(img)) {
          deleteFromCloudinary(product.images[img].public_id);
        } else imagesToKeep.push(product.images[img]);
      }

      // checking delete index were valid or not
      if (ValidDelete !== imagesToKeep.length) {
        return res.status(400).send({
          success: false,
          message: "The specified image not exists",
        });
      }

      // Handle image uploads
      for (let file of req.files) {
        try {
          const result = await uploadFileToCloudinary(
            file.buffer,
            "ProductImage",
            "product"
          );
          // Add new image data to the list of images to keep
          imagesToKeep.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        } catch (uploadError) {
          // if no single file upload success
          if (imagesToKeep.length == 0) {
            return res.status(500).send({
              success: false,
              message: `Failed to upload images.`,
            });
          }
          errorFile = file;
          break;
        }
      }
    }

    // updating all avaiable value
    product.productname = productname ?? product.productname;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.brand = brand ?? product.brand;
    product.length = length ?? product.length;
    product.width = width ?? product.width;
    product.height = height ?? product.height;
    product.weight = weight ?? product.weight;
    product.attributes = attributes ?? product.attributes;
    product.subcategory = isSubcategory?._id ?? product.subcategory;
    product.images = imagesToKeep.length ? imagesToKeep : product.images;

    // Save the updated product in the database
    const updatedProduct = await product.save();

    // Indicate which image failed to upload
    if (errorFile) {
      message = `Failed to upload file (${errorFile.originalname}).`;
    }
    return res.status(200).send({
      success: true,
      message,
      updatedProduct,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in update product API",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await productModel.findOne({
      _id: req.params.id,
    });
    if (!deletedProduct) {
      return res.status(400).send({
        success: false,
        message: "Product doesn't exists",
      });
    }
    if (!deletedProduct.owner.equals(req.userData._id)) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to delete this product.",
      });
    }
    // deleting images
    for (let file of deletedProduct.images) {
      deleteFromCloudinary(file.public_id);
    }
    const result = await productModel.deleteOne({
      _id: deletedProduct._id,
    });
    if (!result) {
      return res.status(200).send({
        success: true,
        message: "Failed to delete Product",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in delete product API",
    });
  }
};
