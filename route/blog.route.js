import { Router } from "express";
import {
  AddBlog,
  deleteBlog,
  getBlog,
  getSingleBlog,
  updateBlog,
  uploadImages,
} from "../controllers/blog.controller.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const blogRouter = Router();

blogRouter.post("/uploadImages", auth, upload.array("images"), uploadImages);
blogRouter.post("/add", auth, AddBlog);
blogRouter.get("/get", getBlog);
blogRouter.get("/get/:id", getSingleBlog);
blogRouter.delete("/delete/:id", deleteBlog);
blogRouter.put("/update/:id", updateBlog);

export default blogRouter;
