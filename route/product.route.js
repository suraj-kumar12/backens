import { Router } from "express";
import upload from "../middlewares/multer.js";
import {
  createProduct,
  createProductRAMS,
  deleteMultipleProduct,
  deleteMultipleProductRams,
  deleteProduct,
  deleteProductRAMS,
  getAllFeaturedProducts,
  getAllProductByRating,
  getAllProductBySubCatName,
  getAllProductByThirdLavelCatId,
  getAllProductByThirdLavelCatName,
  getAllProducts,
  getAllProductsByCatId,
  getAllProductsByCatName,
  getAllProductsByPrice,
  getAllProductsBySubCatId,
  getProduct,
  getProductRam,
  getProductsCount,
  removeImagefromCloudinary,
  updateProduct,
  updateProductRams,
  uploadImages,
  getProductRamById,
  createProductWeight,
  deleteProductWeight,
  deleteMultipleProductWeight,
  updateProductWeight,
  getProductWeightById,
  createProductSize,
  deleteMultipleProductSize,
  updateProductSize,
  deleteProductSize,
  getProductSize,
  getProductSizeById,
  getProductWeight,
  uploadBannerImages,
  filters,
  sortBy,
  searchProductController,
} from "../controllers/product.controller.js";
import auth from "../middlewares/auth.js";

const productRouter = Router();
productRouter.post("/uploadImages", auth, upload.array("images"), uploadImages);
productRouter.post(
  "/uploadBannerImages",
  auth,
  upload.array("bannerimages"),
  uploadBannerImages
);
productRouter.post("/create", auth, createProduct);
productRouter.get("/getAllProducts", getAllProducts);
productRouter.get("/getAllProductsByCatId/:id", getAllProductsByCatId);
productRouter.get("/getAllProductsByCatName", getAllProductsByCatName);
productRouter.get("/getAllProductsBySubCatId/:id", getAllProductsBySubCatId);
productRouter.get("/getAllProductsBySubCatName", getAllProductBySubCatName);
productRouter.get(
  "/getAllProductsByThirdLavelCat/:id",
  getAllProductByThirdLavelCatId
);
productRouter.get(
  "/getAllProductsByThirdLavelCatName",
  getAllProductByThirdLavelCatName
);

productRouter.get("/getAllProductsByPrice", getAllProductsByPrice);
productRouter.get("/getAllProductsByRating", getAllProductByRating);
productRouter.get("/getAllProductsCount", getProductsCount);
productRouter.get("/getAllFeaturedProducts", getAllFeaturedProducts);
productRouter.delete("/deleteMultiple", deleteMultipleProduct);
productRouter.delete("/delete/:id", deleteProduct);

productRouter.get("/:id", getProduct);
productRouter.delete("/deleteImage", auth, removeImagefromCloudinary);
productRouter.put("/updateProduct/:id", auth, updateProduct);

// >>>>>>>>>>>>>>>>>>>>. RAMS >>>>>>>>>>>>>>>>>>>>>>>>>>
productRouter.post("/productRAMS/create", auth, createProductRAMS);
productRouter.delete(
  "/productRAMS/deleteMultipleRams",
  auth,
  deleteMultipleProductRams
);
productRouter.delete("/productRAMS/:id", auth, deleteProductRAMS);

productRouter.put("/productRAMS/:id", auth, updateProductRams);
productRouter.get("/productRAMS/get", getProductRam);
productRouter.get("/productRAMS/:id", getProductRamById);

// >>>>>>>>>>>>>>>>>>>>> Weight >>>>>>>>>>>>>>>>>>>>>>>>>>>

productRouter.post("/productWeight/create", auth, createProductWeight);
productRouter.delete(
  "/productWeight/deleteMultipleWeight",
  auth,
  deleteMultipleProductWeight
);
productRouter.delete("/productWeight/:id", auth, deleteProductWeight);
productRouter.put("/productWeight/:id", auth, updateProductWeight);
productRouter.get("/productWeight/get", getProductWeight);
productRouter.get("/productWeight/:id", auth, getProductWeightById);

// >>>>>>>>>>>>>>>>>>>>>>. Size .<<<<<<<<<<<<<<<<<<<<<<<<<
productRouter.post("/productSize/create", auth, createProductSize);
productRouter.delete(
  "/productSize/deleteMultipleSize",
  auth,
  deleteMultipleProductSize
);
productRouter.delete("/productSize/:id", auth, deleteProductSize);
productRouter.put("/productSize/:id", auth, updateProductSize);
productRouter.get("/productSize/get", getProductSize);
productRouter.get("/productSize/:id", auth, getProductSizeById);

// >>>>>>>>>>>>>>>>>>>>> filter >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
productRouter.post("/filters", filters);
// sort by >>>>>>>>>>>>>>>>>>>>
productRouter.post("/sortBy", sortBy);
productRouter.post("/search/get", searchProductController)
export default productRouter;
