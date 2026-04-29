import BlogModel from "../models/blog.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
  api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
  secure: true,
});

// uploadImages >>>>>>>>>>>>>>>>>>>>
var imagesArr = [];
export const uploadImages = async (request, response) => {
  try {
    // const imagesArr = [];
    const images = request.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < images?.length; i++) {
      const result = await cloudinary.uploader.upload(images[i].path, options);
      imagesArr.push(result.secure_url);

      // delete local file after upload
      fs.unlinkSync(`uploads/${images[i].filename}`);
    }

    return response.status(200).json({
      images: imagesArr,
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

// Add Blog >>>>>>>>>>>>>>>>>>>>>>>>>>>>
export const AddBlog = async (request, response) => {
  try {
    let blog = new BlogModel({
      images: imagesArr,
      title: request.body.title,
      description: request.body.description,
    });

    if (!blog) {
      return response.status(500).json({
        message: "blog not found",
        error: true,
        success: false,
      });
    }

    blog = await blog.save();
    imagesArr = [];

    return response.status(200).json({
      message: "blog created successfully",
      error: false,
      success: true,
      blog: blog,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get blog >>>>>>>>>>>>>>>>>>>

export const getBlog = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10;
    const totalPosts = await BlogModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(400).json({
        message: "page not found",
        error: true,
        success: false,
      });
    }

    const blog = await BlogModel.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!blog || blog.length === 0) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "No blogs found",
      });
    }

    return response.status(200).json({
      message: "All Blog get successfully",
      error: false,
      success: true,
      blog: blog,
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

// get Single blog >>>>>>>>>>>>>>>
export const getSingleBlog = async (request, response) => {
  try {
    const blog = await BlogModel.findById(request.params.id);
    if (!blog) {
      return response.status(400).json({
        message: "Id does not match",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "blog get successfully",
      error: false,
      success: true,
      blog: blog,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// delete Blog >>>>>>>>>>>>>>>>>>>>>>>.
export const deleteBlog = async (request, response) => {
  try {
    const blog = await BlogModel.findById(request.params.id);
    const images = blog.images;
    let img = "";
    for (img of images) {
      const imgUrl = img;
      const imageArr = imgUrl.split("/");
      const image = imageArr[imageArr.length - 1];
      const imageName = image.split(".")[0];

      if (imageName) {
        await cloudinary.uploader.destroy(imageName);
      }
    }

    const deleteBlog = await BlogModel.findByIdAndDelete(request.params.id);
    if (!deleteBlog) {
      return response.status(400).json({
        message: "Blog not deleted",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Blog deleted successfully",
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

// update Blog >>>>>>>>>>>>>>>>>>>>>>>>>>>
export const updateBlog = async (request, response) => {
  try {
    const blog = await BlogModel.findByIdAndUpdate(
      request.params.id,
      {
        title: request.body.title,
        description: request.body.description,
        images: imagesArr.length > 0 ? imagesArr[0] : request.body.images,
      },
      { new: true }
    );

    if (!blog) {
      return response.status(400).json({
        message: "Blog cann't be updated",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Blog updated successfully",
      error: false,
      success: true,
      blog: blog,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
