import BannerV1model from "../models/bannerV1.model.js";

import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
  api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
  secure: true,
});

// upload Image >>>>>>>>>>>>>>

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

//create Banner.........
export const addBanner = async (request, response) => {
  try {
    let banner = new BannerV1model({
      bannerTitle: request.body.bannerTitle,
      images: imagesArr,
      catId: request.body.catId,
      subCatId: request.body.subCatId,
      thirdsubCatId: request.body.thirdsubCatId,
      price: request.body.price,
      alignInfo: request.body.alignInfo,
    });

    if (!banner) {
      return response.status(500).json({
        message: "Banner not Created",
        error: true,
        success: false,
      });
    }

    banner = await banner.save();
    imagesArr = [];

    return response.status(200).json({
      message: "Banner created successfully",
      error: false,
      success: true,
      banner: banner,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get Banner >>>>>>>>>>>>
export const getBanners = async (request, response) => {
  try {
    const banners = await BannerV1model.find();
    if (!banners) {
      return response.status(404).json({
        message: "banners not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Banner get successfully",
      error: false,
      success: true,
      data: banners,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//get single-banner.........
export const getBanner = async (request, response) => {
  try {
    const banner = await BannerV1model.findById(request.params.id);

    if (!banner) {
      return response.status(500).json({
        message: "The category with the given ID was not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      banner: banner,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Delete image from Cloudinary..........
export const removeImageFromCloudinary = async (request, response) => {
  const imgUrl = request.query.img;
  console.log(imgUrl);

  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];

  if (imageName) {
    const res = await cloudinary.uploader.destroy(
      imageName,
      (error, result) => {}
    );

    if (res) {
      response.status(200).json({
        error: false,
        success: true,
        message: "image deleted successfully",
      });
    }
  }
};

// Delete Banner >>>>>>>>>>>>>>>>
export const deleteBanner = async (request, response) => {
  try {
    const banner = await BannerV1model.findById(request.params.id);
    if (!banner) {
      return response.status(404).json({
        message: "Banner not found",
        success: false,
        error: true,
      });
    }
    const images = banner.images;

    for (let img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];

      if (imageName) {
        await cloudinary.uploader.destroy(imageName);
      }
    }

    const deletedBanner = await BannerV1model.findByIdAndDelete(
      request.params.id
    );

    if (!deletedBanner) {
      return response.status(404).json({
        message: "Banner not found",
        success: false,
        error: true,
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Banner  Deleted successfully",
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// update Banners .........
export const updateBanner = async (request, response) => {
  try {
    const banners = await BannerV1model.findByIdAndUpdate(
      request.params.id,
      {
        bannerTitle: request.body.bannerTitle,
        images: imagesArr.length > 0 ? imagesArr[0] : request.body.images,
        catId: request.body.catId,
        subCatId: request.body.subCatId,
        thirdsubCatId: request.body.thirdsubCatId,
        price: request.body.price,
        alignInfo: request.body.alignInfo,
      },
      { new: true }
    );

    if (!banners) {
      return response.status(404).json({
        message: "Banner not found",
        success: false,
        error: true,
      });
    }

    imagesArr = [];

    response.status(200).json({
      message: "banner updated successfully",
      error: false,
      success: true,
      banner: banners,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
