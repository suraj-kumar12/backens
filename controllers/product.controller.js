import { response } from "express";
import productModel from "../models/product.model.js";
import fs from "fs";

import { v2 as cloudinary } from "cloudinary";
import { request } from "http";
import { error } from "console";
import productRAMSModel from "../models/productRAMS.js";
import productWEIGHTModel from "../models/productWEIGHTS.js";
import productSIZESModel from "../models/productSIZES.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
  api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
  secure: true,
});

// image upload........
var imagesArr = [];
export const uploadImages = async (request, response) => {
  try {
    imagesArr = [];
    const image = request.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < image?.length; i++) {
      const img = await cloudinary.uploader.upload(
        image[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${request.files[i].filename}`);
        }
      );
    }

    return response.status(200).json({
      images: imagesArr,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// upload Banner Images >>>>>>>>>>>>>>>>>>>>

var bannerImages = [];

export const uploadBannerImages = async (request, response) => {
  try {
    bannerImages = [];
    const image = request.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < image?.length; i++) {
      const result = await cloudinary.uploader.upload(image[i].path, options);
      bannerImages.push(result.secure_url);
      fs.unlinkSync(`uploads/${image[i].filename}`);
    }

    return response.status(200).json({
      images: bannerImages,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// create product..........
export const createProduct = async (request, response) => {
  try {
    let product = new productModel({
      name: request.body.name,
      description: request.body.description,
      images: imagesArr,
      bannerimages: bannerImages,
      bannerTitleName: request.body.bannerTitleName,
      isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner,
      brand: request.body.brand,
      price: request.body.price,
      oldPrice: request.body.oldPrice,
      catName: request.body.catName,
      catId: request.body.catId,
      subCatId: request.body.subCatId,
      subCat: request.body.subCat,
      thirdsubCat: request.body.thirdsubCat,
      thirdsubCatId: request.body.thirdsubCatId,
      category: request.body.category,
      countInStock: request.body.countInStock,
      rating: request.body.rating,
      isFeatured: request.body.isFeatured,
      discount: request.body.discount,
      productRam: request.body.productRam,
      size: request.body.size,
      productWeight: request.body.productWeight,
    });

    product = await product.save();
    console.log(product);

    if (!product) {
      response.status(500).json({
        error: true,
        success: false,
        message: "product not created",
      });
    }

    imagesArr = [];

    response.status(200).json({
      message: "product created successfully",
      success: true,
      error: false,
      product: product,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get all products.........
export const getAllProducts = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await productModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPosts) {
      return response.status(400).json({
        message: "not found",
        success: false,
        error: true,
      });
    }

    const products = await productModel
      .find()
      .sort({ createdAt: -1 })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get product by category id...........
export const getAllProductsByCatId = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 1000;
    const totalPosts = await productModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPosts) {
      return response.status(400).json({
        message: "not found",
        success: false,
        error: true,
      });
    }

    const products = await productModel
      .find({ catId: request.params.id })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get-all-product-by-category-name..........
export const getAllProductsByCatName = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 1000;
    const totalPosts = await productModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPosts) {
      return response.status(400).json({
        message: "not found",
        success: false,
        error: true,
      });
    }

    const products = await productModel
      .find({ catName: request.query.catName })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//get-all-product-by-subCatId.........
export const getAllProductsBySubCatId = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 1000;
    const totalPosts = await productModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPosts) {
      return response.status(400).json({
        message: "not found",
        success: false,
        error: true,
      });
    }

    const products = await productModel
      .find({ subCatId: request.params.id })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//get-all-product-by-subCat-Name....
export const getAllProductBySubCatName = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 1000;
    const totalPosts = await productModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPosts) {
      return response.status(400).json({
        message: "not found",
        success: false,
        error: true,
      });
    }

    const products = await productModel
      .find({ subCat: request.query.subCat })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//get-all-product-by-thirdLavel-catId......
export const getAllProductByThirdLavelCatId = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 1000;
    const totalPosts = await productModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPosts) {
      return response.status(400).json({
        message: "not found",
        success: false,
        error: true,
      });
    }

    const products = await productModel
      .find({ thirdsubCatId: request.params.id })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//get-all-product-by-thirdLavel-CatName..........
export const getAllProductByThirdLavelCatName = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 1000;
    const totalPosts = await productModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPosts) {
      return response.status(400).json({
        message: "not found",
        success: false,
        error: true,
      });
    }

    const products = await productModel
      .find({ thirdsubCat: request.query.catName })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//get-all-products-by-price
export const getAllProductsByPrice = async (request, response) => {
  try {
    let productList = [];

    if (request.query.catId !== "" && request.query.catId !== undefined) {
      const productListArr = await productModel
        .find({
          catId: request.query.catId,
        })
        .populate("category");

      productList = productListArr;
    }

    if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
      const productListArr = await productModel
        .find({
          subCatId: request.query.subCatId,
        })
        .populate("category");

      productList = productListArr;
    }

    if (
      request.query.thirdsubCatId !== "" &&
      request.query.thirdsubCatId !== undefined
    ) {
      const productListArr = await productModel
        .find({
          thirdsubCatId: request.query.thirdsubCatId,
        })
        .populate("category");

      productList = productListArr;
    }

    const filteredProducts = productList.filter((product) => {
      if (
        request.query.minPrice &&
        product.price < parseInt(+request.query.minPrice)
      ) {
        return false;
      }
      if (
        request.query.maxPrice &&
        product.price > parseInt(+request.query.maxPrice)
      ) {
        return false;
      }
      return true;
    });

    return response.status(200).json({
      error: false,
      success: true,
      products: filteredProducts,
      totalPages: 0,
      page: 0,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get-all-product-by-rating..........
export const getAllProductByRating = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 1000;
    const totalPosts = await productModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPosts) {
      return response.status(400).json({
        message: "not found",
        success: false,
        error: true,
      });
    }

    let products = [];

    if (request.query.catId !== undefined) {
      products = await productModel
        .find({
          rating: request.query.rating,
          catId: request.body.catId,
        })
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }

    if (request.query.subCatId !== undefined) {
      products = await productModel
        .find({
          rating: request.query.rating,
          subCatId: request.body.subCatId,
        })
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }

    if (request.query.thirdsubCat !== undefined) {
      products = await productModel
        .find({
          rating: request.query.rating,
          thirdsubCat: request.body.thirdsubCat,
        })
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get-all-products-counts
export const getProductsCount = async (request, response) => {
  try {
    const productsCount = await productModel.countDocuments();

    if (!productsCount) {
      response.status(500).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      productsCount: productsCount,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//get all featured product.........
export const getAllFeaturedProducts = async (request, response) => {
  try {
    const products = await productModel
      .find({
        isFeatured: true,
      })
      .populate("category");

    if (!products) {
      response.status(500).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//delete-product single............
export const deleteProduct = async (request, response) => {
  try {
    const product = await productModel
      .findById(request.params.id)
      .populate("category");

    if (!product) {
      return response.status(404).json({
        message: "product not found",
        error: true,
        success: false,
      });
    }

    const images = product.images;

    let img = "";
    for (img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];

      const imageName = image.split(".")[0];

      if (imageName) {
        cloudinary.uploader.destroy(imageName, (error, result) => {
          console.log(error, result);
        });
      }
    }

    // delete product from database ........
    const deletedProduct = await productModel.findByIdAndDelete(
      request.params.id
    );

    if (!deletedProduct) {
      response.status(404).json({
        message: "Product not deleted",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "product deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// delete multiple product with image ............

export const deleteMultipleProduct = async (request, response) => {
  const { ids } = request.body;
  if (!ids || !Array.isArray(ids)) {
    return response.status(400).json({
      error: true,
      success: false,
      message: "invalid Input",
    });
  }

  for (let i = 0; i < ids?.length; i++) {
    const product = await productModel.findById(ids[i]);

    const images = product.images;
    let img = "";

    for (img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];

      if (imageName) {
        cloudinary.uploader.destroy(imageName, (error, result) => {
          // console.log(error, result);
        });
      }
    }
  }

  try {
    await productModel.deleteMany({ _id: { $in: ids } });
    return response.status(200).json({
      message: "Product delete successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get-single-product...............

export const getProduct = async (request, response) => {
  try {
    const product = await productModel
      .findById(request.params.id)
      .populate("category");

    if (!product) {
      return response.status(500).json({
        message: "The product is not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      product: product,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// delete image............
export const removeImagefromCloudinary = async (request, response) => {
  try {
    const imgUrl = request.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    if (imageName) {
      const res = await cloudinary.uploader.destroy(
        imageName,
        (error, result) => {
          console.log(error, result);
        }
      );

      if (res) {
        response.status(200).send(res);
      }
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// update product.......
export const updateProduct = async (request, response) => {
  try {
    const product = await productModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
        subCat: request.body.subCat,
        description: request.body.description,
        isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner,
        images: request.body.images,
        bannerimages: request.body.bannerimages,
        bannerTitleName: request.body.bannerTitleName,
        brand: request.body.brand,
        price: request.body.price,
        oldPrice: request.body.oldPrice,
        catId: request.body.catId,
        catName: request.body.catName,
        subCat: request.body.subCat,
        subCatId: request.body.subCatId,
        category: request.body.category,
        thirdsubCat: request.body.thirdsubCat,
        thirdsubCatName: request.body.thirdsubCatName,
        thirdsubCatId: request.body.thirdsubCatId,
        countInStock: request.body.countInStock,
        rating: request.body.rating,

        isFeatured: request.body.isFeatured,
        productRam: request.body.productRam,
        size: request.body.size,
        productWeight: request.body.productWeight,
      },
      { new: true }
    );

    if (!product) {
      response.status(404).json({
        message: "the product can not be updated",
        status: false,
      });
    }

    imagesArr = [];

    return response.status(200).json({
      message: "The product is updated",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> RAM >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// create RAMS PRODUCT ...........
export const createProductRAMS = async (request, response) => {
  try {
    let productRAMS = new productRAMSModel({
      name: request.body.name,
    });

    productRAMS = await productRAMS.save();

    if (!productRAMS) {
      response.status(500).json({
        error: true,
        success: false,
        message: "Product RAMS NOT Created",
      });
    }

    return response.status(200).json({
      message: "Product RAMS created Successfully",
      success: true,
      error: false,
      product: productRAMS,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// delete Product RAMS ...................
export const deleteProductRAMS = async (request, response) => {
  const productRams = await productRAMSModel.findById(request.params.id);

  if (!productRams) {
    return response.status(404).json({
      message: "item is not found",
      error: true,
      success: false,
    });
  }

  const deleteProductRams = await productRAMSModel.findByIdAndDelete(
    request.params.id
  );

  if (!deleteProductRams) {
    response.status(404).json({
      message: "Item not deleted",
      success: false,
      error: true,
    });
  }

  return response.status(200).json({
    success: true,
    error: false,
    message: "Product RAMS Deleted Successfully",
  });
};
//  delete multiple product Rams .............
export const deleteMultipleProductRams = async (request, response) => {
  const { ids } = request.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return response.status(400).json({
      error: true,
      success: false,
      message: "Invalid Input — IDs are required",
    });
  }

  try {
    await productRAMSModel.deleteMany({ _id: { $in: ids } });
    return response.status(200).json({
      message: "Product Ram deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ........update product Rams..............
export const updateProductRams = async (request, response) => {
  try {
    const productRam = await productRAMSModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
      }
    );

    if (!productRam) {
      return response.status(404).json({
        message: "The product RAM can not be updated",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "The Product RAM is updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ............get product Rams................
export const getProductRam = async (request, response) => {
  try {
    const productRam = await productRAMSModel.find();

    if (!productRam || productRam.length === 0) {
      return response.status(404).json({
        message: "No Product RAMs found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      data: productRam,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get Product RAMS BY ID ..........
export const getProductRamById = async (request, response) => {
  try {
    const productRam = await productRAMSModel.findById(request.params.id);

    if (!productRam) {
      return response.status(404).json({
        message: "Product RAMS IS NOT FOUND",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      data: productRam,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Weight >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ..............Created Product Weight .....................
export const createProductWeight = async (request, response) => {
  try {
    let productWeight = new productWEIGHTModel({
      name: request.body.name,
    });

    productWeight = await productWeight.save();

    if (!productWeight) {
      return response.status(400).json({
        message: "Product Weight not created",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Product Weight Successfully Created",
      error: false,
      success: true,
      product: productWeight,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// delete Product weight ..............
export const deleteProductWeight = async (request, response) => {
  try {
    const productWeight = await productWEIGHTModel.findById(request.params.id);

    if (!productWeight) {
      return response.status(400).json({
        message: "Item not found",
        error: true,
        success: false,
      });
    }

    const deleteProductWeight = await productWEIGHTModel.findByIdAndDelete(
      request.params.id
    );

    if (!deleteProductWeight) {
      return response.status(400).json({
        message: "Product Weight not deleted",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Product Weight Deleted Successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// delete Multiple Product Weight .................
export const deleteMultipleProductWeight = async (request, response) => {
  const { ids } = request.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return response.status(400).json({
      message: "Invalid input IDS is required",
      error: true,
      success: false,
    });
  }

  try {
    await productWEIGHTModel.deleteMany({ _id: { $in: ids } });
    return response.status(200).json({
      message: "Product Weight Deleted Successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// update product weight ..............
export const updateProductWeight = async (request, response) => {
  try {
    const productWeight = await productWEIGHTModel.findById(request.params.id);
    if (!productWeight) {
      return response.status(400).json({
        message: "input id is not found",
        error: true,
        success: false,
      });
    }

    const updateProductWeight = await productWEIGHTModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
      },
      { new: true }
    );

    if (!updateProductWeight) {
      return response.status(400).json({
        message: "product Weight not updated",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Product Weight update successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get product weight ...........
export const getProductWeight = async (request, response) => {
  try {
    const productWeight = await productWEIGHTModel.find();

    if (!productWeight || productWeight.length === 0) {
      return response.status(400).json({
        message: "no product weight found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Product Weight get successfully",
      error: false,
      success: true,
      data: productWeight,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get product By Id .................
export const getProductWeightById = async (request, response) => {
  try {
    const productWeight = await productWEIGHTModel.findById(request.params.id);

    if (!productWeight) {
      return response.status(404).json({
        message: "Product Weight not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "product get successfully",
      error: false,
      success: true,
      data: productWeight,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SIZE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// create product size .................
export const createProductSize = async (request, response) => {
  try {
    let productSize = new productSIZESModel({
      name: request.body.name,
    });

    productSize = await productSize.save();

    if (!productSize) {
      return response.status(404).json({
        message: "Product Size is not created",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Product Size Created Successfully",
      error: false,
      success: true,
      product: productSize,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// deleted product size ..................
export const deleteProductSize = async (request, response) => {
  try {
    const productSize = await productSIZESModel.findById(request.params.id);
    if (!productSize) {
      return response.status(404).json({
        message: "Item not found",
        error: true,
        success: false,
      });
    }

    const deleteProductSize = await productSIZESModel.findByIdAndDelete(
      request.params.id
    );

    if (!deleteProductSize) {
      return response.status(404).json({
        message: "product size not deleted",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "product deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ..delete multiple product size .............
export const deleteMultipleProductSize = async (request, response) => {
  try {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return response.status(400).json({
        message: "Invalid request: IDs must be an array",
        error: true,
        success: false,
      });
    }

    const deleteMultipleProductSize = await productSIZESModel.deleteMany({
      _id: { $in: ids },
    });

    if (!deleteMultipleProductSize) {
      return response.status(404).json({
        message: "delete multiple product",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Product Size deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// update product size ......................
export const updateProductSize = async (request, response) => {
  try {
    const productSize = await productSIZESModel.findById(request.params.id);

    if (!productSize) {
      return response.status(400).json({
        message: "item not found",
        error: true,
        success: false,
      });
    }

    const updateProductSize = await productSIZESModel.findByIdAndUpdate(
      request.params.id,
      { name: request.body.name },
      { new: true }
    );

    if (!updateProductSize) {
      return response.status(404).json({
        message: "product size not updated",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Product Size updated successfully",
      error: false,
      success: true,
      product: updateProductSize,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get product size .................
export const getProductSize = async (request, response) => {
  try {
    const productSize = await productSIZESModel.find();

    if (!productSize || productSize.length === 0) {
      return response.status(404).json({
        message: "product size not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "get Product successfully",
      error: false,
      success: true,
      data: productSize,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get product size by id ..................
export const getProductSizeById = async (request, response) => {
  try {
    const productSize = await productSIZESModel.findById(request.params.id);

    if (!productSize) {
      return response.status(404).json({
        message: "product size not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Product get successfully",
      error: false,
      success: true,
      data: productSize,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// filter >>>>>>>>>>>>>>>>>>>>>>
export const filters = async (request, response) => {
  const {
    catId,
    subCatId,
    thirdsubCatId,
    minPrice,
    maxPrice,
    rating,
    page,
    limit,
  } = request.body;

  const filters = {};

  if (catId?.length) {
    filters.catId = { $in: catId };
  }

  if (subCatId?.length) {
    filters.subCatId = { $in: subCatId };
  }

  if (thirdsubCatId?.length) {
    filters.thirdsubCat = { $in: thirdsubCatId };
  }

  if (minPrice || maxPrice) {
    filters.price = { $gte: +minPrice || 0, $lte: +maxPrice || Infinity };
  }

  if (rating?.length) {
    filters.rating = { $in: rating };
  }

  try {
    const products = await productModel
      .find(filters)
      .populate("category")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await productModel.countDocuments(filters);

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// sort By >>>>>>>>>>>>>
export const sortItems = (products, sortBy, order) => {
  return products.sort((a, b) => {
    if (sortBy === "name") {
      return order === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name); // ✅ sahi
    }

    if (sortBy === "price") {
      return order === "asc" ? a.price - b.price : b.price - a.price;
    }

    return 0;
  });
};

export const sortBy = async (request, response) => {
  const { products, sortBy, order } = request.body;
  const sortedItems = sortItems([...products?.products], sortBy, order);

  return response.status(200).json({
    error: false,
    success: true,
    products: sortedItems,
    page: 0,
    totalPages: 0,
  });
};

export const searchProductController = async(request, response) => {
  try {
   
    const {query, page, limit, } = request.body;
    console.log(query)
    if(!query){
      return response.status(400).json({
        message: "Query is required",
        error: true,
        success: false
      })
    }

    const products = await productModel.find({
      $or: [
        {name: {$regex: query, $options: "i"}},
        {brand: {$regex: query, $options: "i"}},
        {catName: {$regex: query, $options: "i"}},
        {subCat: {$regex: query, $options: "i"}},
        {thirdsubCat: {$regex: query, $options: "i"}}
      ]
    })
    .populate("category").skip((page - 1) * limit).limit(parseInt(limit))

    const total = await productModel.countDocuments(products);

    return response.status(200).json({
      error: false,
      success: true,
      products: products,
      total:total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    })
  }
}


// export const searchProductController = async (request, response) => {
//   try {
//     const { q, page, limit } = request.query;

//     if (!q) {
//       return response.status(400).json({
//         message: "Query is required",
//         error: true,
//         success: false
//       });
//     }

//     const filter = {
//       $or: [
//         { name: { $regex: q, $options: "i" } },
//         { brand: { $regex: q, $options: "i" } },
//         { catName: { $regex: q, $options: "i" } },
//         { subCat: { $regex: q, $options: "i" } },
//         { thirdsubCat: { $regex: q, $options: "i" } }
//       ]
//     };

//     const products = await productModel
//       .find(filter)
//       .populate("category")
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     const total = await productModel.countDocuments(filter);

//     return response.status(200).json({
//       error: false,
//       success: true,
//       products,
//       total,
//       page: Number(page),
//       totalPages: Math.ceil(total / limit)
//     });

//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     });
//   }
// };
