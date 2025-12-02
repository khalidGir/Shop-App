import asyncHandler from 'express-async-handler';
import Purchase from '../models/purchaseModel.js';
import Product from '../models/productModels.js';
import Supplier from '../models/supplierModel.js';
import StockMovement from '../models/stockMovementModel.js';

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private
const getPurchases = asyncHandler(async (req, res) => {
    const purchases = await Purchase.find({})
        .populate('supplier', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
    res.json(purchases);
});

// @desc    Get purchase by ID
// @route   GET /api/purchases/:id
// @access  Private
const getPurchaseById = asyncHandler(async (req, res) => {
    const purchase = await Purchase.findById(req.params.id)
        .populate('supplier', 'name email phone')
        .populate('purchaseItems.product', 'name')
        .populate('createdBy', 'name');

    if (purchase) {
        res.json(purchase);
    } else {
        res.status(404);
        throw new Error('Purchase not found');
    }
});

// @desc    Create a purchase
// @route   POST /api/purchases
// @access  Private
const createPurchase = asyncHandler(async (req, res) => {
    const { supplier, purchaseItems, totalCost, purchaseDate, notes } = req.body;

    if (!purchaseItems || purchaseItems.length === 0) {
        res.status(400);
        throw new Error('No purchase items');
        return;
    }

    // Verify supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
        res.status(404);
        throw new Error('Supplier not found');
    }

    const purchase = new Purchase({
        supplier,
        purchaseItems,
        totalCost,
        purchaseDate: purchaseDate || Date.now(),
        status: 'Pending',
        notes,
        createdBy: req.user._id,
    });

    const createdPurchase = await purchase.save();
    res.status(201).json(createdPurchase);
});

// @desc    Update a purchase
// @route   PUT /api/purchases/:id
// @access  Private
const updatePurchase = asyncHandler(async (req, res) => {
    const { supplier, purchaseItems, totalCost, purchaseDate, status, notes } = req.body;

    const purchase = await Purchase.findById(req.params.id);

    if (purchase) {
        purchase.supplier = supplier || purchase.supplier;
        purchase.purchaseItems = purchaseItems || purchase.purchaseItems;
        purchase.totalCost = totalCost || purchase.totalCost;
        purchase.purchaseDate = purchaseDate || purchase.purchaseDate;
        purchase.status = status || purchase.status;
        purchase.notes = notes !== undefined ? notes : purchase.notes;

        const updatedPurchase = await purchase.save();
        res.json(updatedPurchase);
    } else {
        res.status(404);
        throw new Error('Purchase not found');
    }
});

// @desc    Delete a purchase
// @route   DELETE /api/purchases/:id
// @access  Private
const deletePurchase = asyncHandler(async (req, res) => {
    const purchase = await Purchase.findById(req.params.id);

    if (purchase) {
        if (purchase.status === 'Received') {
            res.status(400);
            throw new Error('Cannot delete a received purchase order');
        }

        await purchase.deleteOne();
        res.json({ message: 'Purchase removed' });
    } else {
        res.status(404);
        throw new Error('Purchase not found');
    }
});

// @desc    Mark purchase as received (updates inventory)
// @route   PUT /api/purchases/:id/receive
// @access  Private
const receivePurchase = asyncHandler(async (req, res) => {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
        res.status(404);
        throw new Error('Purchase not found');
    }

    if (purchase.status === 'Received') {
        res.status(400);
        throw new Error('Purchase already received');
    }

    // Update product inventory
    for (const item of purchase.purchaseItems) {
        const product = await Product.findById(item.product);
        if (product) {
            const previousStock = product.countInStock;
            product.countInStock += item.quantity;
            await product.save();

            // Log stock movement
            await StockMovement.create({
                product: product._id,
                type: 'Purchase',
                quantity: item.quantity,
                previousStock,
                newStock: product.countInStock,
                reason: `Purchase Order #${purchase._id}`,
                reference: purchase._id,
                createdBy: req.user._id,
            });
        }
    }

    purchase.status = 'Received';
    const updatedPurchase = await purchase.save();

    res.json(updatedPurchase);
});

export {
    getPurchases,
    getPurchaseById,
    createPurchase,
    updatePurchase,
    deletePurchase,
    receivePurchase,
};
