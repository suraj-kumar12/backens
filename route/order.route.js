
import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  createOrderController,
  getOrderDetailsController,
  totalSalesController,
  totalUsersControllers,
  updateOrderStatusController,
} from "../controllers/order.controller.js";    


const orderRouter = Router();


orderRouter.post("/create", auth, createOrderController);
orderRouter.get("/order-list", auth, getOrderDetailsController);
orderRouter.put("/order-status/:_id", auth, updateOrderStatusController);
orderRouter.get("/sales", auth, totalSalesController);
orderRouter.get("/users", auth, totalUsersControllers);
export default orderRouter;
