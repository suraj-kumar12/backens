import { response } from "express";
import myListModel from "../models/myList.model.js";
// import cartProductModel from "../models/cartproduct.model.js";

export const addToMyListController = async (request, response) => {
  try {
    const userId = request.userId; //middleware
    const {
      productId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      brand,
      discount,
    } = request.body;

    const item = await myListModel.findOne({
      userId: userId,
      productId: productId,
    });

    if (item) {
      return response.status(404).json({
        message: "Item already in my List",
      });
    }

    const myList = new myListModel({
      productId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      brand,
      discount,
      userId,
    });

    const save = await myList.save();

    return response.status(200).json({
      error: false,
      success: true,
      message: "The product add in the my list",
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const deleteToMyListController = async (request, response) => {
  try {
    const myListItem = await myListModel.findById(request.params.id);

    if (!myListItem) {
      response.status(404).json({
        message: "the item with this given id was not found",
        error: true,
        success: false,
      });
    }

    const deletedItem = await myListModel.findByIdAndDelete(request.params.id);

    if (!deletedItem) {
      response.status(404).json({
        message: "this item is not deleted",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "The item is deleted be successfully",
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

export const getMyListController = async (request, response) => {
  try {
    const userId = request.userId;
    const myListItems = await myListModel.find({
      userId: userId,
    });

    return response.status(200).json({
      error: false,
      success: true,
      data: myListItems,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
