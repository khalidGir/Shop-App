import asyncHandler from 'express-async-handler';
import Order from '../models/orderModels.js';
import Expense from '../models/expenseModel.js';
import Product from '../models/productModels.js';

// @desc    Get dashboard summary data
// @route   GET /api/dashboard
// @access  Private/Admin
const getDashboardSummary = asyncHandler(async (req, res) => {
  // 1. Calculate Total Sales Revenue and Order Count
  const salesData = await Order.aggregate([
    {
      $match: { isPaid: true },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  // 2. Calculate Total Expenses
  const expenseData = await Expense.aggregate([
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: '$amount' },
      },
    },
  ]);

  // 3. Get Top Selling Products
  const topProducts = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalQuantitySold: { $sum: '$orderItems.qty' },
      },
    },
    { $sort: { totalQuantitySold: -1 } },
    { $limit: 5 }, // Get top 5 products
    {
      $lookup: {
        from: 'products', // the name of the products collection in the DB
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails',
    },
    {
      $project: {
        _id: '$_id',
        name: '$productDetails.name',
        totalQuantitySold: '$totalQuantitySold',
      },
    },
  ]);

  const totalRevenue = salesData.length > 0 ? salesData[0].totalRevenue : 0;
  const orderCount = salesData.length > 0 ? salesData[0].orderCount : 0;
  const totalExpenses = expenseData.length > 0 ? expenseData[0].totalExpenses : 0;

  res.json({
    totalRevenue,
    orderCount,
    totalExpenses,
    profit: totalRevenue - totalExpenses,
    topProducts,
  });
});

export { getDashboardSummary };
