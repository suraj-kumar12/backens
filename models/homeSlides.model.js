import mongoose from "mongoose";

const homeSliderSchema = mongoose.Schema(
  {
    images: [
      {
        type: String,
        required: true,
      },
    ],

    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const homeSlidesModel = mongoose.model("homeSlides", homeSliderSchema);

export default homeSlidesModel;
