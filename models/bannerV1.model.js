import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    bannerTitle: {
      type: String,
      default: "",
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    catId: {
      type: String,
      default: "",
      required: true,
    },

    subCatId: {
      type: String,
      default: "",
    },

    thirdsubCatId: {
      type: String,
      default: "",
    },

    alignInfo: {
      type: String,
      default: "",
      required: true,
    },

    price: {
      type: Number,
      default: "",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BannerV1model = mongoose.model("bannerV1", bannerSchema);
export default BannerV1model;
