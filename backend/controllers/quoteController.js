import asyncHandler from 'express-async-handler';
import Quote from '../models/quoteModel.js';
import Order from '../models/orderModels.js';

// @desc    Create new quote
// @route   POST /api/quotes
// @access  Private/Admin
const addQuote = asyncHandler(async (req, res) => {
  const { quoteItems, shippingAddress, totalPrice } = req.body;

  if (quoteItems && quoteItems.length === 0) {
    res.status(400);
    throw new Error('No quote items');
  }

  const quote = new Quote({
    user: req.user._id,
    quoteItems,
    shippingAddress,
    totalPrice,
  });

  const createdQuote = await quote.save();
  res.status(201).json(createdQuote);
});

// @desc    Get all quotes
// @route   GET /api/quotes
// @access  Private/Admin
const getQuotes = asyncHandler(async (req, res) => {
  const quotes = await Quote.find({}).populate('user', 'name');
  res.json(quotes);
});

// @desc    Get quote by ID
// @route   GET /api/quotes/:id
// @access  Private/Admin
const getQuoteById = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id).populate('user', 'name');

  if (quote) {
    res.json(quote);
  } else {
    res.status(404);
    throw new Error('Quote not found');
  }
});

// @desc    Convert quote to order
// @route   POST /api/quotes/:id/convert
// @access  Private/Admin
const convertQuoteToOrder = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);

  if (quote) {
    const order = new Order({
      user: quote.user,
      orderItems: quote.quoteItems,
      shippingAddress: quote.shippingAddress,
      // Assuming default payment method, and prices need recalculation
      paymentMethod: 'To be determined',
      taxPrice: 0, // Example value, should be calculated
      shippingPrice: 0, // Example value, should be calculated
      totalPrice: quote.totalPrice, // Or recalculate
    });

    const createdOrder = await order.save();

    quote.status = 'Converted';
    await quote.save();

    res.status(201).json(createdOrder);
  } else {
    res.status(404);
    throw new Error('Quote not found');
  }
});

export { addQuote, getQuotes, getQuoteById, convertQuoteToOrder };
