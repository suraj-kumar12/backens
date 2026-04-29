import { Router } from "express";
import {
  addAddressController,
  deleteAddressController,
  editAddressController,
  getAddressController,
  getSingleAddressController,
} from "../controllers/address.controller.js";
import auth from "../middlewares/auth.js";

const addressRouter = Router();

addressRouter.post("/add", auth, addAddressController);
addressRouter.get("/get", auth, getAddressController);
addressRouter.get("/get/:id", auth, getSingleAddressController);
addressRouter.delete("/:id", auth, deleteAddressController);
addressRouter.put("/:id", auth, editAddressController);

export default addressRouter;
