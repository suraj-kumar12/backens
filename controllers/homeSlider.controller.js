// import

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import homeSlidesModel from "../models/homeSlides.model.js";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

// ............uploadImages >>>>>>>>>>>>>>>>>>
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
      const img = await cloudinary.uploader.upload(image[i].path, options); // ✅ बिना callback

      imagesArr.push(img.secure_url); // ✅ result आता है img में
      fs.unlinkSync(`uploads/${request.files[i].filename}`);
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

// >>>>>>>>>>>>>>>>>>>>>>.AddHomeSlide>>>>>>>>>>>>>>>>>>>>>>>>>>> Creae >>>>>>>>>>>>>>>>>>>>>>
export const AddHomeSlide = async (request, response) => {
  try {
    let slide = new homeSlidesModel({
      images: imagesArr,
    });

    if (!slide) {
      return response.status(404).json({
        message: "Slide not created",
        error: true,
        success: false,
      });
    }

    slide = await slide.save();

    imagesArr = [];

    return response.status(200).json({
      message: "slide created",
      error: false,
      success: false,
      slide: slide,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// >>>>>>>>>>>>>>>>>>>>>getHomeSlide>>>>>>>>>>>>>>>>>>>>>
export const getHomeSlides = async (request, response) => {
  try {
    const slides = await homeSlidesModel.find();
    if (!slides) {
      return response.status(400).json({
        message: "slides not found",
        error: true,
        success: fase,
      });
    }

    return response.status(200).json({
      message: "slides get successfully",
      error: false,
      success: true,
      data: slides,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get slide by id for Singal>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
export const getHomeSlide = async (request, response) => {
  try {
    const slide = await homeSlidesModel.findById(request.params.id);
    if (!slide) {
      return response.status(400).json({
        message: "The slide with the given id was not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "get data successfully",
      error: false,
      success: true,
      slide: slide,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// remove image from cloudinary ................ >>>>>>>>>>>>>>>
export const removeImageFromCloudinary = async (request, response) => {
  try {
    const imgUrl = request.query.img;

    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    if (imageName) {
      const res = await cloudinary.uploader.destroy(imageName);
      if (res) {
        return response.status(200).json({
          message: "image deleted successfully",
          error: false,
          success: true,
        });
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

// delete Slide singel>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
export const deleteSlide = async (request, response) => {
  try {
    const slide = await homeSlidesModel.findById(request.params.id);

    if (!slide) {
      return response.status(404).json({
        message: "Slide not found",
        error: true,
        success: false,
      });
    }

    const images = slide.images;

    let img = "";
    for (img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];

      if (imageName) {
        await cloudinary.uploader.destroy(imageName);
      }
    }

    const deleteSlide = await homeSlidesModel.findByIdAndDelete(
      request.params.id
    );

    if (!deleteSlide) {
      return response.status(400).json({
        message: "slide not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "slide deleted successfully",
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

// delete multiple product image ..........................
export const deleteMultipleSlides = async (request, response) => {
  const { ids } = request.body;

  if (!ids || !Array.isArray(ids)) {
    return response.status(400).json({
      error: true,
      success: false,
      message: "invalid input",
    });
  }

  // Step 1: Delete all images from Cloudinary
  for (let i = 0; i < ids?.length; i++) {
    const slide = await homeSlidesModel.findById(ids[i]);
    const images = slide.images;

    let img = "";
    for (img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];

      if (imageName) {
        await cloudinary.uploader.destroy(imageName);
      }
    }
  }

  try {
    // Step 2: Delete all slides from MongoDB
    await homeSlidesModel.deleteMany({ _id: { $in: ids } });
    return response.status(200).json({
      message: "slides deleted successfully",
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

// update Slide >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
export const updatedSlide = async (request, response) => {
  try {
    const slide = await homeSlidesModel.findByIdAndUpdate(
      request.params.id,
      {
        images: imagesArr.length > 0 ? imagesArr[0] : request.body.images,
      },
      { new: true }
    );

    if (!slide) {
      return response.status(404).json({
        message: "slide cannot be updated",
        error: true,
        success: false,
      });
    }

    imagesArr = [];

    response.status(200).json({
      message: "slide update successfully",
      error: false,
      success: true,
      slide: slide,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
