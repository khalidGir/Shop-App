import asyncHandler from 'express-async-handler';
import Invoice from '../models/invoiceModel.js';
import Order from '../models/orderModels.js';
import Customer from '../models/customerModel.js';

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({})
        .populate('customer', 'name email')
        .sort({ createdAt: -1 });
    res.json(invoices);
});

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)
        .populate('customer', 'name email address phone')
        .populate('createdBy', 'name email');

    if (invoice) {
        res.json(invoice);
    } else {
        res.status(404);
        throw new Error('Invoice not found');
    }
});

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = asyncHandler(async (req, res) => {
    const {
        customer,
        items,
        subtotal,
        tax,
        total,
        status,
        issueDate,
        dueDate,
        notes,
    } = req.body;

    // Generate Invoice Number (Simple auto-increment logic or random for now)
    // Ideally, query last invoice and increment.
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const invoice = new Invoice({
        invoiceNumber,
        customer,
        items,
        subtotal,
        tax,
        total,
        status,
        issueDate,
        dueDate,
        notes,
        createdBy: req.user._id,
    });

    const createdInvoice = await invoice.save();
    res.status(201).json(createdInvoice);
});

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);

    if (invoice) {
        invoice.customer = req.body.customer || invoice.customer;
        invoice.items = req.body.items || invoice.items;
        invoice.subtotal = req.body.subtotal || invoice.subtotal;
        invoice.tax = req.body.tax || invoice.tax;
        invoice.total = req.body.total || invoice.total;
        invoice.status = req.body.status || invoice.status;
        invoice.issueDate = req.body.issueDate || invoice.issueDate;
        invoice.dueDate = req.body.dueDate || invoice.dueDate;
        invoice.notes = req.body.notes || invoice.notes;

        const updatedInvoice = await invoice.save();
        res.json(updatedInvoice);
    } else {
        res.status(404);
        throw new Error('Invoice not found');
    }
});

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);

    if (invoice) {
        await invoice.deleteOne();
        res.json({ message: 'Invoice removed' });
    } else {
        res.status(404);
        throw new Error('Invoice not found');
    }
});

// @desc    Generate invoice from order
// @route   POST /api/invoices/generate/:orderId
// @access  Private
const generateInvoiceFromOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId).populate('customer');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (!order.customer) {
        res.status(400);
        throw new Error('Order does not have a linked customer. Please link a customer first.');
    }

    // Check if invoice already exists for this order
    const existingInvoice = await Invoice.findOne({ order: order._id });
    if (existingInvoice) {
        res.status(400);
        throw new Error(`Invoice already exists for this order: ${existingInvoice.invoiceNumber}`);
    }

    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const items = order.orderItems.map(item => ({
        name: item.name,
        quantity: item.qty,
        price: item.price,
        amount: item.qty * item.price,
    }));

    const invoice = new Invoice({
        invoiceNumber,
        customer: order.customer._id,
        order: order._id,
        items,
        subtotal: order.itemsPrice || (order.totalPrice - order.taxPrice - order.shippingPrice),
        tax: order.taxPrice,
        total: order.totalPrice,
        status: order.isPaid ? 'Paid' : 'Sent',
        issueDate: Date.now(),
        dueDate: Date.now() + 14 * 24 * 60 * 60 * 1000, // Due in 14 days
        notes: `Generated from Order #${order._id}`,
        createdBy: req.user._id,
    });

    const createdInvoice = await invoice.save();
    res.status(201).json(createdInvoice);
});

export {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoiceFromOrder,
};
