// import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import VerificationEmail from "../utils/veryfyEmailtemplate.js";
import userModel from "../models/user.model.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import { v2 as cloudinary } from "cloudinary";
import fs, { access } from "fs";
import { response } from "express";
import { error } from "console";
import { request } from "http";
import ReviewModel from "../models/reviews.model.js";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

// Register...
export async function registerUserController(request, response) {
  try {
    let user;
    const { name, email, password } = request.body;
    if (!name || !email || !password) {
      return response.status(400).json({
        message: "provide email, name, password",
        error: true,
        success: false,
      });
    }

    user = await userModel.findOne({ email: email });
    if (user) {
      return response.status(400).json({
        message: "User already registered with this email",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    user = new userModel({
      email: email,
      password: hashPassword,
      name: name,
      otp: verifyCode,
      otpExpires: Date.now() + 5 * 60 * 1000,
    });

    await user.save();

    // send verification email
    await sendEmailFun({
      to: email,
      subject: "Verify email from Ecommerce App",
      text: "",
      html: VerificationEmail(name, verifyCode),
    });

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return response.status(200).json({
      success: true,
      message: "User registered successfully! Please verify your email",
      token,
    });

    return response.status(400).json({
      success: false,
      message: "User already registered with this email",
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// VerifyEmail...........
export const verifyEmailController = async (request, response) => {
  try {
    const { email, otp } = request.body;
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    const isCodeValid = user.otp === otp;
    const isNotExpirerd = user.otpExpires > Date.now();

    if (isCodeValid && isNotExpirerd) {
      user.verify_email = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return response.status(200).json({
        error: false,
        success: true,
        message: "Email Verify Successfully",
      });
    } else if (!isCodeValid) {
      return response.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    } else {
      response.status(400).json({
        error: true,
        success: false,
        message: "OTP Expires",
      });
    }
  } catch (error) {
    response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const authWithGoogle = async (request, response) => {
  const { name, email, mobile, avatar, role } = request.body;
  try {
    let user = await userModel.findOne({ email });

    if (!user) {
      // Create new user
      user = await userModel.create({
        name,
        email,
        mobile,
        avatar,
        password: "null", // better than "null"
        role,
        verify_email: true,
        signUpWithGoogle: true,
        last_login_date: new Date(),
      });
    } else {
      // Update last login date for existing users
      await userModel.findByIdAndUpdate(user._id, {
        last_login_date: new Date(),
      });
    }

    // Generate tokens for both new and existing users
    const accesstoken = await generatedAccessToken(user._id);
    const refreshtoken = await generatedRefreshToken(user._id);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.cookie("accessToken", accesstoken, cookiesOption);
    response.cookie("refreshToken", refreshtoken, cookiesOption);

    return response.status(200).json({
      message: "Login successfully",
      error: false,
      success: true,
      data: { accesstoken, refreshtoken },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Login............
export const loginUserController = async (request, response) => {
  try {
    const { email, password } = request.body;

    const user = await userModel.findOne({ email: email });

    if (!user) {
      response.status(400).json({
        message: "user not Register",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      response.status(400).json({
        message: "contact to Admin",
        error: true,
        success: false,
      });
    }

    if (user.verify_email !== true) {
      response.status(400).json({
        message: "Your Email is not verify yet please verify your email first",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return response.status(400).json({
        message: "Check your Password",
        error: true,
        success: false,
      });
    }

    const accesstoken = await generatedAccessToken(user._id);
    const refreshtoken = await generatedRefreshToken(user._id);

    const updateUser = await userModel.findByIdAndUpdate(user?._id, {
      last_login_date: new Date(),
    });

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.cookie("accessToken", accesstoken, cookiesOption);
    response.cookie("refreshToken", refreshtoken, cookiesOption);

    return response.json({
      message: "Login Successfully",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshtoken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Logout............
export const logoutController = async (request, response) => {
  try {
    const userid = request.userId;

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.clearCookie("accessToken", cookiesOption);
    response.clearCookie("refreshToken", cookiesOption);

    const removeRefreshToken = await userModel.findByIdAndUpdate(userid, {
      refresh_token: "",
    });

    response.setHeader("Cache-Control", "no-store");
    return response.status(200).json({
      message: "Logout Successfully",
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

// image upload.......
var imagesArr = [];
export const userAvatarController = async (request, response) => {
  try {
    imagesArr = [];

    const userId = request.userId;
    const image = request.files;

    const user = await userModel.findOne({ _id: userId });

    // first remove image from cloudinary.analysis............

    const imgUrl = user.avatar;
    const urlArr = imgUrl.split("/");
    const avatar_image = urlArr[urlArr.length - 1];
    const imageName = avatar_image.split(".")[0];

    if (imageName) {
      const res = await cloudinary.uploader.destroy(
        imageName,
        (error, result) => {}
      );
    }

    if (!user) {
      return response.status(500).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

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
          console.log(request.files[i].filename);
        }
      );
    }

    user.avatar = imagesArr[0];
    await user.save();

    return response.status(200).json({
      _id: userId,
      avatar: imagesArr[0],
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// .......remove image from cloudinary...........
export const removeImageFromCloudinary = async (request, response) => {
  const imgUrl = request.query.img;
  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];

  if (imageName) {
    const res = await cloudinary.uploader.destroy(
      imageName,
      (error, result) => {}
    );

    if (res) {
      response.status(200).send(res);
    }
  }
};

// ...update userDetail...........
export const updateUserDetails = async (request, response) => {
  try {
    const userId = request.userId;
    const { name, email, mobile, password } = request.body;
    const userExist = await userModel.findById(userId);
    if (!userExist) {
      return response.status(500).send("The user cannot be Updated!");
    }

    const updateUser = await userModel.findByIdAndUpdate(
      userId,
      {
        name: name,
        mobile: mobile,
        email: email,
      },
      { new: true }
    );

    //send Verification email.............
    if (email !== userExist.email) {
      await sendEmailFun({
        to: email,
        subject: "Verify Email From EcommerceApp",
        text: "",
        html: VerificationEmail(name, verifyCode),
      });
    }

    return response.json({
      message: "User Updated Successfully",
      error: false,
      success: true,
      user: {
        name: updateUser?.name,
        _id: updateUser?._id,
        email: updateUser?.email,
        mobile: updateUser?.mobile,
        avatar: updateUser?.avatar,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// forgot password.............
export const forgotPasswordController = async (request, response) => {
  try {
    const { email } = request.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return response.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    } else {
      let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      (user.otp = verifyCode),
        (user.otpExpires = Date.now() + 5 * 60 * 1000),
        await user.save();

      await sendEmailFun({
        to: email,
        subject: "verify OTP from ecommerceApp",
        text: "",
        html: VerificationEmail(user?.name, verifyCode),
      });

      return response.json({
        message: "check your email",
        error: false,
        success: true,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// .........verifyForgotPasswordOtp........
export const verifyForgotPasswordOtp = async (request, response) => {
  try {
    const { email, otp } = request.body;

    const user = await userModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "Email not Available",
        error: true,
        success: false,
      });
    }

    if (!email || !otp) {
      return response.status(400).json({
        message: "provide required field email, otp.",
        error: true,
        success: false,
      });
    }

    if (otp !== user.otp) {
      return response.status(400).json({
        message: "Invalid Otp",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date().toISOString;

    if (user.otpExpires < currentTime) {
      return response.status(400).json({
        message: "Otp is expired",
        error: true,
        success: false,
      });
    }

    user.otp = "";
    user.otpExpires = "";
    await user.save();

    return response.status(200).json({
      message: "OTP Verified",
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

// update-password-....
export const updatePassword = async (request, response) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = request.body;

    if (!email || !newPassword || !confirmPassword) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "provide required field email,newPassword,confirmPassword",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(oldPassword, user.password);
    if (!checkPassword) {
      return response.status(400).json({
        message: "your old password is wrong",
        error: true,
        success: false,
      });
    }

    if (user?.signUpWithGoogle === false) {
      const checkPassword = await bcryptjs.compare(oldPassword, user.password);
      if (!checkPassword) {
        return response.status(400).json({
          message: "your old password is wrong",
          error: true,
          success: false,
        });
      }
    }

    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "New password and confirm password must be same",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    const update = await userModel.findOneAndUpdate(user?._id, {
      password: hashPassword,
    });

    return response.status(200).json({
      message: "Password updated Successfully",
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

// update password .........
export const resetPassword = async (request, response) => {
  try {
    const { email, newPassword, confirmPassword } = request.body;

    if (!email || !newPassword || !confirmPassword) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "Provide required fields: email, newPassword, confirmPassword",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "Email is not registered",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "New password and confirm password must match",
        error: true,
        success: false,
      });
    }

    // hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    await userModel.findByIdAndUpdate(user._id, { password: hashPassword });

    return response.status(200).json({
      message: "Password updated successfully",
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

// refresh token-controller...........
export const refreshToken = async (request, response) => {
  try {
    // .........token-get..........
    const refreshToken =
      request.cookies.refreshToken ||
      request?.header?.authorization?.split(" ")[1];

    if (!refreshToken) {
      return response.status(400).json({
        message: "Invalid Token",
        error: true,
        success: false,
      });
    }

    // ......verify-token...........
    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN
    );

    if (!verifyToken) {
      return response.status(401).json({
        message: "token is expired",
        error: true,
        success: false,
      });
    }

    const userId = verifyToken?._id;
    const newAccessToken = await generatedAccessToken(userId);
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.cookie("accessToken", newAccessToken, cookiesOption);

    return response.json({
      message: "New Acces Token Generated",
      error: false,
      success: true,
      data: {
        accesstoken: newAccessToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// get-login-user-detail............
export const userDetails = async (request, response) => {
  try {
    const userId = request.userId;
    const user = await userModel
      .findById(userId)
      .select("-password -refresh_token")
      .populate("address_details");

    return response.status(200).json({
      message: "user Detail",
      data: user,
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

// addReview >>>>>>>>>>>>>>>>>>>>
export const addReviews = async (request, response) => {
  try {
    const { image, userName, review, rating, userId, productId } = request.body;

    const userReview = new ReviewModel({
      image: image,
      userName: userName,
      review: review,
      rating: rating,
      userId: userId,
      productId: productId,
    });

    await userReview.save();

    return response.status(200).json({
      message: "Review added successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false,
    });
  }
};

export const getReviews = async (request, response) => {
  try {
    const productId = request.query.productId;
    const reviews = await ReviewModel.find({ productId: productId });

    if (!reviews) {
      return response.status(404).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      reviews: reviews,
    });
  } catch (error) {
    return response.status(400).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getAllUsers = async (request, response) => {
  try {
    const users = await userModel.find();
    if(!users){
      return response.status(404).json({
        error: true,
        success: false,
      });
    } 
   
    return response.status(200).json({
      error: false,
      success: true,
      users: users,
    })
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    })
  }
}

export const getAllReviews = async (request, response) => {
  try {
    const reviews = await ReviewModel.find();

    if(!reviews) {
      return response.status(404).json({
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      error: false,
      success: true,
      reviews: reviews,
    })
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    })
    
  }
}

//  delete multiple users ................. 

export const deleteMultiple = async (request, response) => {
  const { ids } = request.body.data;
  if (!ids || !Array.isArray(ids)) {
    return response.status(400).json({
      error: true,
      success: false,
      message: "invalid Input",
    });
  }

  // for (let i = 0; i < ids?.length; i++) {
  //   const user = await userModel.findById(ids[i]);

  //   const images = user.images;
  //   let img = "";

  //   for (img of images) {
  //     const imgUrl = img;
  //     const urlArr = imgUrl.split("/");
  //     const image = urlArr[urlArr.length - 1];
  //     const imageName = image.split(".")[0];

  //     if (imageName) {
  //       cloudinary.uploader.destroy(imageName, (error, result) => {
  //         // console.log(error, result);
  //       });
  //     }
  //   }
  // }

  try {
    await userModel.deleteMany({ _id: { $in: ids } });
    return response.status(200).json({
      message: "user delete successfully",
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