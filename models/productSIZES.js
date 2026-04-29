import mongoose from "mongoose";

const productSIZESSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const productSIZESModel = mongoose.model("productSIZES", productSIZESSchema);
export default productSIZESModel;
