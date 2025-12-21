import asyncHandler from 'express-async-handler';
import Order from '../models/orderModels.js';

import Product from '../models/productModels.js';
import StockMovement from '../models/stockMovementModel.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, discount } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Get the product details from the database for each order item
  const itemsWithPrices = await Promise.all(
    orderItems.map(async item => {
      const product = await Product.findById(item._id);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item._id}`);
      }
      return {
        ...item,
        price: product.price,
      };
    })
  );

  // Calculate prices
  const itemsPrice = itemsWithPrices.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  
  // Tax rate (e.g., 15%)
  const taxRate = 0.15;
  const taxPrice = itemsPrice * taxRate;

  // Shipping cost
  const shippingPrice = itemsPrice > 100 ? 0 : 10;

  let totalPrice = itemsPrice + taxPrice + shippingPrice;

  // Apply discount if provided
  if (discount && discount > 0) {
    totalPrice -= discount;
  }
  
  const order = new Order({
    orderItems: itemsWithPrices.map(item => ({ ...item, product: item._id })),
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();

  // After creating the order, update the stock
  for (const item of createdOrder.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      const previousStock = product.countInStock;
      product.countInStock -= item.qty;
      await product.save();

      // Log stock movement
      await StockMovement.create({
        product: product._id,
        type: 'Sale',
        quantity: -item.qty,
        previousStock,
        newStock: product.countInStock,
        reason: `Order #${createdOrder._id}`,
        reference: createdOrder._id,
        createdBy: req.user._id,
      });
    }
  }

  res.status(201).json(createdOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

export { addOrderItems, getOrderById, updateOrderToPaid, getMyOrders };
