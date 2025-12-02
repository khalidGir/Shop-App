import asyncHandler from 'express-async-handler';
import Product from '../models/productModels.js';
import Order from '../models/orderModels.js';
import StockMovement from '../models/stockMovementModel.js';

// @desc    Get low stock alerts
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStockAlerts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate('supplier', 'name');

    const lowStockProducts = products.filter(product => {
        return product.countInStock <= product.reorderPoint;
    });

    // Categorize by severity
    const critical = lowStockProducts.filter(p => p.countInStock <= p.minStock);
    const warning = lowStockProducts.filter(p => p.countInStock > p.minStock && p.countInStock <= p.reorderPoint);

    res.json({
        critical,
        warning,
        total: lowStockProducts.length,
    });
});

// @desc    Get reorder suggestions based on sales velocity
// @route   GET /api/inventory/reorder-suggestions
// @access  Private
const getReorderSuggestions = asyncHandler(async (req, res) => {
    const daysToAnalyze = 30;
    const leadTimeDays = 7; // Assume 7 days lead time
    const safetyBufferDays = 7; // Extra buffer

    const products = await Product.find({}).populate('supplier', 'name');
    const suggestions = [];

    // Get orders from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - daysToAnalyze);

    const recentOrders = await Order.find({
        createdAt: { $gte: thirtyDaysAgo },
    });

    for (const product of products) {
        // Calculate total units sold in last 30 days
        let totalSold = 0;
        recentOrders.forEach(order => {
            const orderItem = order.orderItems.find(item =>
                item.product.toString() === product._id.toString()
            );
            if (orderItem) {
                totalSold += orderItem.qty;
            }
        });

        const avgDailySales = totalSold / daysToAnalyze;
        const daysOfStockRemaining = avgDailySales > 0
            ? product.countInStock / avgDailySales
            : 999;

        const requiredDays = leadTimeDays + safetyBufferDays;

        // Suggest reorder if stock will run out before next delivery
        if (daysOfStockRemaining < requiredDays && avgDailySales > 0) {
            const suggestedQuantity = Math.ceil(
                (avgDailySales * requiredDays) - product.countInStock
            );

            suggestions.push({
                product: {
                    _id: product._id,
                    name: product.name,
                    currentStock: product.countInStock,
                    reorderPoint: product.reorderPoint,
                    reorderQuantity: product.reorderQuantity,
                    supplier: product.supplier,
                },
                analytics: {
                    avgDailySales: parseFloat(avgDailySales.toFixed(2)),
                    totalSoldLast30Days: totalSold,
                    daysOfStockRemaining: parseFloat(daysOfStockRemaining.toFixed(1)),
                    suggestedQuantity,
                    urgency: daysOfStockRemaining < 7 ? 'high' : 'medium',
                },
            });
        }
    }

    // Sort by urgency (lowest days remaining first)
    suggestions.sort((a, b) =>
        a.analytics.daysOfStockRemaining - b.analytics.daysOfStockRemaining
    );

    res.json(suggestions);
});

// @desc    Get stock turnover rate
// @route   GET /api/inventory/turnover
// @access  Private
const getStockTurnover = asyncHandler(async (req, res) => {
    const daysToAnalyze = parseInt(req.query.days) || 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);

    const products = await Product.find({});
    const orders = await Order.find({
        createdAt: { $gte: startDate },
    });

    const turnoverData = products.map(product => {
        // Calculate total units sold
        let totalSold = 0;
        orders.forEach(order => {
            const orderItem = order.orderItems.find(item =>
                item.product.toString() === product._id.toString()
            );
            if (orderItem) {
                totalSold += orderItem.qty;
            }
        });

        // Average inventory (simplified: current stock)
        const avgInventory = product.countInStock;

        // Turnover rate = units sold / average inventory
        const turnoverRate = avgInventory > 0 ? totalSold / avgInventory : 0;

        return {
            product: {
                _id: product._id,
                name: product.name,
                currentStock: product.countInStock,
            },
            totalSold,
            turnoverRate: parseFloat(turnoverRate.toFixed(2)),
            category: turnoverRate > 2 ? 'fast-moving' : turnoverRate > 0.5 ? 'medium-moving' : 'slow-moving',
        };
    });

    // Sort by turnover rate (highest first)
    turnoverData.sort((a, b) => b.turnoverRate - a.turnoverRate);

    res.json(turnoverData);
});

// @desc    Get inventory value
// @route   GET /api/inventory/value
// @access  Private
const getInventoryValue = asyncHandler(async (req, res) => {
    const products = await Product.find({});

    let totalValue = 0;
    let totalUnits = 0;

    const productValues = products.map(product => {
        const value = product.countInStock * product.price;
        totalValue += value;
        totalUnits += product.countInStock;

        return {
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                stock: product.countInStock,
            },
            value,
        };
    });

    res.json({
        totalValue,
        totalUnits,
        productCount: products.length,
        products: productValues.sort((a, b) => b.value - a.value),
    });
});

// @desc    Get stock levels overview
// @route   GET /api/inventory/stock-levels
// @access  Private
const getStockLevels = asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate('supplier', 'name');

    const stockLevels = products.map(product => ({
        _id: product._id,
        name: product.name,
        currentStock: product.countInStock,
        minStock: product.minStock,
        reorderPoint: product.reorderPoint,
        reorderQuantity: product.reorderQuantity,
        supplier: product.supplier,
        status: product.countInStock <= product.minStock
            ? 'critical'
            : product.countInStock <= product.reorderPoint
                ? 'warning'
                : 'ok',
    }));

    const summary = {
        total: products.length,
        critical: stockLevels.filter(p => p.status === 'critical').length,
        warning: stockLevels.filter(p => p.status === 'warning').length,
        ok: stockLevels.filter(p => p.status === 'ok').length,
    };

    res.json({
        summary,
        products: stockLevels,
    });
});

export {
    getLowStockAlerts,
    getReorderSuggestions,
    getStockTurnover,
    getInventoryValue,
    getStockLevels,
};
