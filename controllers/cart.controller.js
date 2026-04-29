import { response } from "express";
import cartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";

// ..............AddToCart >>>>>>>>>>>>>>>>>>>>>>>>>>

export const addToCartItemController = async (request, response) => {
  try {
    const userId = request.userId;
    const {
      productId,
      quantity,
      image,
      rating,
      price,
      oldPrice,
      discount,
      size,
      weight,
      ram,
      brand,
      subTotal,
      countInStock,
      productTitle,
    } = request.body;

    if (!productId) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "Provide productId",
      });
    }

    const checkItemCart = await cartProductModel.findOne({
      userId: userId,
      productId: productId,
    });

    if (checkItemCart) {
      return response.status(400).json({
        message: "Item already in cart",
      });
    }

    const cartItem = new cartProductModel({
      productTitle: productTitle,
      image: image,
      rating: rating,
      price: price,
      oldPrice: oldPrice,
      discount: discount,
      size: size,
      weight: weight,
      ram: ram,
      brand: brand,
      quantity: quantity,
      subTotal: subTotal,
      countInStock: countInStock,
      userId: userId,
      productId: productId,
    });

    const save = await cartItem.save();

    return response.status(200).json({
      data: save,
      message: "item added successfully",
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

// get cart items controller ...................
export const getCartItemController = async (request, response) => {
  try {
    const userId = request.userId;

    const cartItem = await cartProductModel.find({
      userId: userId,
    });

    return response.status(200).json({
      data: cartItem,
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

// update cart item quantity controller ...................
export const updateCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id, qty, subTotal, size, weight, ram } = request.body;

    if (!_id || !qty) {
      return response.status(404).json({
        message: "provide _id, qty",
      });
    }

    const updateCartItem = await cartProductModel.updateOne(
      {
        _id: _id,
        userId: userId,
      },
      {
        quantity: qty,
        subTotal: subTotal,
        size: size,
        weight: weight,
        ram: ram,
      },
      { new: true }
    );

    return response.status(200).json({
      message: "Update Cart successfully",
      success: true,
      error: false,
      data: updateCartItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// delete cart item quantity controller ...................
// export const deleteCartItemQtyController = async (request, response) => {
//   try {
//     const userId = request.userId; //middleware
//     const { _id } = request.params.id;

//     if (!_id) {
//       return response.status(404).json({
//         message: "provide _id",
//         error: true,
//         success: false,
//       });
//     }

//     const deleteCartItem = await cartProductModel.deleteOne({
//       _id: _id,
//       userId: userId,
//     });

//     if (!deleteCartItem) {
//       return response.status(404).json({
//         message: "the product in the cart is not found",
//         error: true,
//         success: false,
//       });
//     }

//     return response.status(200).json({
//       message: "remove Item",
//       error: false,
//       success: true,
//       data: deleteCartItem,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// };

export const deleteCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId; // from middleware
    const _id = request.params.id;

    console.log(_id);

    if (!_id) {
      return response.status(404).json({
        message: "Provide _id",
        error: true,
        success: false,
      });
    }

    const deleteCartItem = await cartProductModel.deleteOne({
      _id: _id,
      userId: userId,
    });

    if (deleteCartItem.deletedCount === 0) {
      return response.status(404).json({
        message: "The product in the cart was not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Item removed successfully",
      error: false,
      success: true,
      data: deleteCartItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};


// empty cart controller ........ 
export const emptyCartController = async (request, response) => {
  try {
    const userId = request.params.id;
    await cartProductModel.deleteMany({userId: userId});
    return response.status(200).json({
      error: false,
      success: true,
      message: "Cart emptied successfully",
    })
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}