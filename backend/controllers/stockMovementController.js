import asyncHandler from 'express-async-handler';
import StockMovement from '../models/stockMovementModel.js';
import Product from '../models/productModels.js';

// @desc    Get all stock movements
// @route   GET /api/stock-movements
// @access  Private
const getStockMovements = asyncHandler(async (req, res) => {
    const { productId, type, startDate, endDate } = req.query;

    let query = {};

    if (productId) query.product = productId;
    if (type) query.type = type;
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const movements = await StockMovement.find(query)
        .populate('product', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(100);

    res.json(movements);
});

// @desc    Get stock movements for a specific product
// @route   GET /api/stock-movements/product/:id
// @access  Private
const getProductStockMovements = asyncHandler(async (req, res) => {
    const movements = await StockMovement.find({ product: req.params.id })
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });

    res.json(movements);
});

// @desc    Create manual stock adjustment
// @route   POST /api/stock-movements
// @access  Private
const createStockMovement = asyncHandler(async (req, res) => {
    const { productId, quantity, reason } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const previousStock = product.countInStock;
    const newStock = previousStock + quantity;

    if (newStock < 0) {
        res.status(400);
        throw new Error('Insufficient stock for this adjustment');
    }

    // Create movement record
    const movement = await StockMovement.create({
        product: productId,
        type: 'Adjustment',
        quantity,
        previousStock,
        newStock,
        reason,
        createdBy: req.user._id,
    });

    // Update product stock
    product.countInStock = newStock;
    await product.save();

    res.status(201).json(movement);
});

// @desc    Get recent stock movements
// @route   GET /api/stock-movements/recent
// @access  Private
const getRecentMovements = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;

    const movements = await StockMovement.find({})
        .populate('product', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(limit);

    res.json(movements);
});

export {
    getStockMovements,
    getProductStockMovements,
    createStockMovement,
    getRecentMovements,
};
