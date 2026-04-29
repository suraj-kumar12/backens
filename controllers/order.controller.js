import { parse } from "dotenv";
import OrderModel from "../models/order.model.js";
import productModel from "../models/product.model.js";

export const createOrderController = async (request, response) => {
    try {
        let order = new OrderModel({
            orderId: `ORD-${Date.now()}`,
            userId: request.body.userId,
            products: request.body.products,
            paymentId: request.body.paymentId,
            payment_status: request.body.payment_status,
            delivery_address: request.body.delivery_address,
            totalAmt: request.body.totalAmt,
            date: request.body.date,

        })
        if(!order) {
            response.status(500).json({
                error: true,
                success: false,
            })   
        }
        for(let i = 0; i < request.body.products.length; i++) {
            await productModel.findByIdAndUpdate(
                request.body.products[i].productId,
                {
                    countInStock: parseInt(request.body.products[i].countInStock-request.body.products[i].quantity)
                },
                {new:true}
            )
        }

        order = await order.save();
        return response.status(200).json({
            error: false,
            success: true,
            message: "Order Placed",
            order: order,
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        })
    }
}

export const getOrderDetailsController = async (request, response) => {
    try {
        const userId = request.userId
        const {page, limit} = request.query;
        const orderlist = await OrderModel.find().sort({ createdAt: -1}) .populate("delivery_address userId")
        const total = await OrderModel.countDocuments(orderlist);

        return response.status(200).json({
            message: "order list",
            data: orderlist,
            error: false,
            success: true,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        return response.status(500).json({
            error: true,
            success: false,
            
        })
    }
}

export const updateOrderStatusController = async (request, response) => {
    try {
        const { id, order_status } = request.body;
    const updateOrder = await OrderModel.updateOne(
        { _id: id },
        { order_status: order_status },
        { new: true }
    )
        return response.status(200).json({
            error: false,
            success: true,
            message: "Order status updated",
            data: updateOrder,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

// sales .......... 

// export const totalSalesController = async (request, response) => {
//     try {
//         const currentYear = new Date().getFullYear();
//         const orderList = await OrderModel.find()

//         let totalSales = 0;
//         let mnothlySales = [
//             {
//                 name: 'JAN',
//                 TotalSales: 0
//             },
//             {
//                 name: 'FEB',
//  TotalSales: 0            },
//             {
//                 name: 'MAR',
//                 totalSales: 0
//             },
//             {
//                 name: 'APR',
//  TotalSales: 0            },
//             {
//                 name: 'MAY',
//  TotalSales: 0            },
//             {
//                 name: 'JUN',
//  TotalSales: 0            },
//             {
//                 name: 'JUL',
//  TotalSales: 0            },
//             {
//                 name: 'AUG',
//                  TotalSales: 0
//             },
//             {
//                 name: 'SEP',
//  TotalSales: 0            },
//             {
//                 name: 'OCT',
//  TotalSales: 0            },
//             {
//                 name: 'NOV',
//  TotalSales: 0            },
//             {
//                 name: 'DEC',
//  TotalSales: 0            },
//         ]

//         for(let i = 0; i < orderList.length; i++) {
//             totalSales = totalSales + parseInt(orderList[i].totalAmt);
//             const str = JSON.stringify(orderList[i]?.createdAt)
//             const year = str.substr(1,4);
//             const monthStr = parseInt(monthStr.substr(0,2))

//             if(currentYear == year) {
//                 if(month === 1) {
//                     mnothlySales[0]={
//                         name:"JAN",
//                         TotalSales: mnothlySales[0].TotalSales=parseInt(mnothlySales[0].TotalSales)+parseInt(orderList[i].totalAmt)
//                     }
//                 }

//                     if(month === 2) {
//                     mnothlySales[1]={
//                         name:"frb",
//                         TotalSales: mnothlySales[1].TotalSales=parseInt(mnothlySales[0].TotalSales)+parseInt(orderList[i].totalAmt)
//                     }
//                 }

//                     if(month === 3) {
//                     mnothlySales[2]={
//                         name:"MAR",
//                         TotalSales: mnothlySales[2].TotalSales=parseInt(mnothlySales[0].TotalSales)+parseInt(orderList[i].totalAmt)
//                     }
//                 }

//                  if(month === 4) {
//                     mnothlySales[3]={
//                         name:"APR",
//                         TotalSales: mnothlySales[3].TotalSales=parseInt(mnothlySales[0].TotalSales)+parseInt(orderList[i].totalAmt)
//                     }
//                 }

//                  if(month === 5) {
//                     mnothlySales[4]={
//                         name:"MAY",
//                         TotalSales: mnothlySales[4].TotalSales=parseInt(mnothlySales[0].TotalSales)+parseInt(orderList[i].totalAmt)
//                     }
//                 }

//                  if(month === 6) {
//                     mnothlySales[5]={
//                         name:"JUN",
//                         TotalSales: mnothlySales[5].TotalSales=parseInt(mnothlySales[0].TotalSales)+parseInt(orderList[i].totalAmt)
//                     }
//                 }

//                  if(month === 7) {
//                     mnothlySales[6]={
//                         name:"JUL",
//                         TotalSales: mnothlySales[6].TotalSales=parseInt(mnothlySales[0].TotalSales)+parseInt(orderList[i].totalAmt)
//                     }
//                 }

//                  if(month === 8) {
//                     mnothlySales[7]={
//                         name:"AUG",
//                         TotalSales: mnothlySales[7].TotalSales=parseInt(mnothlySales[0].TotalSales)+parseInt(orderList[i].totalAmt)
//                     }
//                 }

//                  if(month === 9) {
//                     mnothlySales[8]={
//                         name:"SEP",
//                         TotalSales: mnothlySales[8].TotalSales=parseInt(mnothlySales[0].TotalSales)+parseInt(orderList[i].totalAmt)
//                     }
//                 }

//                  if(month === 10) {
//                     mnothlySales[9]={
//                         name:"OCT",
//                         TotalSales: mnothlySales[9].TotalSales=parseInt(mnothlySales[0].TotalSales)+parseInt(orderList[i].totalAmt)
//                     }
//                 }

//                  if(month === 11) {
//                     mnothlySales[10]={
//                         name:"NOV",
//                         TotalSales: mnothlySales[10].TotalSales=parseInt(mnothlySales[0].TotalSales)+parseInt(orderList[i].totalAmt)
//                     }
//                 }

//                  if(month === 12) {
//                     mnothlySales[11]={
//                         name:"DEC",
//                         TotalSales: mnothlySales[11].TotalSales=parseInt(mnothlySales[0].TotalSales)+parseInt(orderList[i].totalAmt)
//                     }
//                 }
//             }

//         }

//         return response.status(200).json({
//             totalSales: totalSales,
//             mnothlySales: mnothlySales,
//             error: false,
//             success: true,
//         })
//     } catch (error) {
//         return response.status(500).json({
//             error:true,
//             success: false,
//             message: error.message
//         })
        
//     }
// }

export const totalSalesController = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const orders = await OrderModel.find();

    const monthlySales = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString("en", { month: "short" }).toUpperCase(),
      TotalSales: 0,
    }));

    let totalSales = 0;

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const year = date.getFullYear();
      const monthIndex = date.getMonth(); // 0–11

      const amount = Number(order.totalAmt) || 0;
      totalSales += amount;

      if (year === currentYear) {
        monthlySales[monthIndex].TotalSales += amount;
      }
    });

    return res.status(200).json({
      totalSales,
      monthlySales,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};


// Total Users ........... 
// export const totalUsersControllers = async (request, response) => {
//     try {
//         const users = await UserModel.aggregate([
//             {
//                 $group: {
//                     _id: {
//                         $year: { $year: "createdAt"},
//                         $month: {$month: "createdAt"}
//                     },
//                     count: { $sum: 1}
//                 }
//             },
//             {
//                 $sort: {"_id.year": 1, "_id.month":1}
//             },
//         ])

//          let monthlyUsers = [
//             {
//                 name: 'JAN',
//                 TotalSales: 0
//             },
//             {
//                 name: 'FEB',
//  TotalSales: 0            },
//             {
//                 name: 'MAR',
//                 totalSales: 0
//             },
//             {
//                 name: 'APR',
//  TotalSales: 0            },
//             {
//                 name: 'MAY',
//  TotalSales: 0            },
//             {
//                 name: 'JUN',
//  TotalSales: 0            },
//             {
//                 name: 'JUL',
//  TotalSales: 0            },
//             {
//                 name: 'AUG',
//                  TotalSales: 0
//             },
//             {
//                 name: 'SEP',
//  TotalSales: 0            },
//             {
//                 name: 'OCT',
//  TotalSales: 0            },
//             {
//                 name: 'NOV',
//  TotalSales: 0            },
//             {
//                 name: 'DEC',
//  TotalSales: 0            },
//         ]

//         for(let i = 0; i < users?.length; i++) {
//             if(users[i]?._id?.month === 1) {
//                 monthlyUsers[0]= {
//                     name: 'JAN',
//                     TotalUsers: users[i].count
//                 }
//             }

//              if(users[i]?._id?.month === 2) {
//                 monthlyUsers[1]= {
//                     name: 'FEB',
//                     TotalUsers: users[i].count
//                 }
//             }

//              if(users[i]?._id?.month === 3) {
//                 monthlyUsers[2]= {
//                     name: 'MAR',
//                     TotalUsers: users[i].count
//                 }
//             }

//              if(users[i]?._id?.month === 4) {
//                 monthlyUsers[3]= {
//                     name: 'APR',
//                     TotalUsers: users[i].count
//                 }
//             }

//              if(users[i]?._id?.month === 5) {
//                 monthlyUsers[4]= {
//                     name: 'MAY',
//                     TotalUsers: users[i].count
//                 }
//             }

//              if(users[i]?._id?.month === 6) {
//                 monthlyUsers[5]= {
//                     name: 'JUN',
//                     TotalUsers: users[i].count
//                 }
//             }

//             if(users[i]?._id?.month === 7) {
//                 monthlyUsers[6]= {
//                     name: 'JUL',
//                     TotalUsers: users[i].count
//                 }
//             }

//             if(users[i]?._id?.month === 8) {
//                 monthlyUsers[7]= {
//                     name: 'AUG',
//                     TotalUsers: users[i].count
//                 }
//             }

//             if(users[i]?._id?.month === 9) {
//                 monthlyUsers[8]= {
//                     name: 'SEP',
//                     TotalUsers: users[i].count
//                 }
//             }

//             if(users[i]?._id?.month === 10) {
//                 monthlyUsers[9]= {
//                     name: 'OCT',
//                     TotalUsers: users[i].count
//                 }
//             }

//             if(users[i]?._id?.month === 11) {
//                 monthlyUsers[10]= {
//                     name: 'NOV',
//                     TotalUsers: users[i].count
//                 }
//             }

//             if(users[i]?._id?.month === 12) {
//                 monthlyUsers[11]= {
//                     name: 'DEC',
//                     TotalUsers: users[i].count
//                 }
//             }

            
//         }

//         return response.status(200).json({
//             TotalUsers: monthlyUsers,
//             error: false,
//             success: true,
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false,
//         })
//     }
// }

export const totalUsersControllers = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const users = await OrderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyUsers = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString("en", { month: "short" }).toUpperCase(),
      TotalUsers: 0,
    }));

    users.forEach((item) => {
      const index = item._id - 1;
      monthlyUsers[index].TotalUsers = item.count;
    });

    return res.status(200).json({
      TotalUsers: monthlyUsers,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};
