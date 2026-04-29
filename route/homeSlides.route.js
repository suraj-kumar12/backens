import { Router } from "express";
import {
  AddHomeSlide,
  deleteMultipleSlides,
  deleteSlide,
  getHomeSlide,
  getHomeSlides,
  removeImageFromCloudinary,
  updatedSlide,
  uploadImages,
} from "../controllers/homeSlider.controller.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
const homeSlidesRouter = Router();

homeSlidesRouter.post(
  "/uploadImages",
  auth,
  upload.array("images"),
  uploadImages
);
homeSlidesRouter.post("/add", auth, AddHomeSlide);
homeSlidesRouter.get("/", getHomeSlides);
homeSlidesRouter.get("/:id", getHomeSlide);
homeSlidesRouter.delete("/deleteImage", auth, removeImageFromCloudinary);
homeSlidesRouter.delete("/delete-multiple", auth, deleteMultipleSlides);
homeSlidesRouter.delete("/delete/:id", auth, deleteSlide);
homeSlidesRouter.put("/:id", auth, updatedSlide);

export default homeSlidesRouter;
