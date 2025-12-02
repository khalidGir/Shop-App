import asyncHandler from 'express-async-handler';
import Payment from '../models/paymentModel.js';
import Customer from '../models/customerModel.js';
import Invoice from '../models/invoiceModel.js';

// @desc    Record a new payment
// @route   POST /api/payments
// @access  Private
const recordPayment = asyncHandler(async (req, res) => {
    const {
        customer: customerId,
        invoice: invoiceId,
        amount,
        paymentDate,
        paymentMethod,
        reference,
        notes,
    } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    // Create Payment Record
    const payment = new Payment({
        customer: customerId,
        invoice: invoiceId,
        amount,
        paymentDate,
        paymentMethod,
        reference,
        notes,
        createdBy: req.user._id,
    });

    const createdPayment = await payment.save();

    // Update Customer Balance (Decrease balance)
    customer.currentBalance = Math.max(0, customer.currentBalance - amount);
    await customer.save();

    // Update Invoice Status if linked
    if (invoiceId) {
        const invoice = await Invoice.findById(invoiceId);
        if (invoice) {
            // Simple logic: if payment covers remaining balance, mark paid.
            // For now, let's just mark as Paid if amount >= total.
            // In a real system, we'd track amountPaid on invoice.
            // Let's assume full payment for simplicity or check if balance is cleared.
            // Ideally we should add `amountPaid` to Invoice model too, but for now:
            if (amount >= invoice.total) {
                invoice.status = 'Paid';
            } else {
                // Partial payment logic could go here
                // invoice.status = 'Partial'; 
            }
            await invoice.save();
        }
    }

    res.status(201).json(createdPayment);
});

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({})
        .populate('customer', 'name')
        .populate('invoice', 'invoiceNumber')
        .sort({ createdAt: -1 });
    res.json(payments);
});

// @desc    Get payments for a specific customer
// @route   GET /api/payments/customer/:id
// @access  Private
const getCustomerPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({ customer: req.params.id })
        .populate('invoice', 'invoiceNumber')
        .sort({ createdAt: -1 });
    res.json(payments);
});

export {
    recordPayment,
    getPayments,
    getCustomerPayments,
};
