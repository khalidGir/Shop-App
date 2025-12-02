import asyncHandler from 'express-async-handler';
import Order from '../models/orderModels.js';
import Purchase from '../models/purchaseModel.js';
import Expense from '../models/expenseModel.js';
import Invoice from '../models/invoiceModel.js';

// @desc    Get financial summary (Revenue, COGS, Gross Profit, Expenses, Net Profit)
// @route   GET /api/finance/summary
// @access  Private/Admin
const getFinancialSummary = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate || endDate) {
        dateQuery.createdAt = {};
        if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
        if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // 1. Revenue (Total Paid Orders)
    const orders = await Order.find({ ...dateQuery, isPaid: true });
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    // 2. COGS (Cost of Goods Sold)
    // Simplified: Sum of purchase cost for items sold. 
    // More accurate: Track cost per item in order. 
    // For now, we'll use a simplified approach or if we stored cost in order items.
    // Let's assume we didn't store cost in order items yet (we stored price).
    // We'll estimate COGS based on average margin or if we have purchase history.
    // BETTER APPROACH for this iteration: Use Total Purchases as "Cash Outflow for Goods" 
    // and for Profit/Loss, we really need cost of sold items. 
    // Let's check if Order Items have cost. They don't.
    // We'll use Total Purchases in the period as a proxy for COGS in a simple cash-basis accounting,
    // OR we can try to find the product cost.
    // Let's fetch products to get current cost.
    // Note: This is an estimation as cost might have changed.

    // Let's use Total Purchases for now as "Cost of Inventory Acquired"
    const purchases = await Purchase.find({ ...dateQuery });
    const totalPurchases = purchases.reduce((acc, p) => acc + p.totalCost, 0);

    // 3. Expenses (Operating Expenses)
    const expenses = await Expense.find({ ...dateQuery });
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    // 4. Calculations
    // Gross Profit = Revenue - COGS (using Total Purchases as proxy for now)
    const grossProfit = totalRevenue - totalPurchases;

    // Net Profit = Gross Profit - Expenses
    const netProfit = grossProfit - totalExpenses;

    res.json({
        revenue: totalRevenue,
        cogs: totalPurchases, // Labelled as "Inventory Costs" in UI
        grossProfit,
        expenses: totalExpenses,
        netProfit,
        orderCount: orders.length,
        purchaseCount: purchases.length,
        expenseCount: expenses.length,
    });
});

// @desc    Get Cash Flow (Inflows vs Outflows)
// @route   GET /api/finance/cash-flow
// @access  Private/Admin
const getCashFlow = asyncHandler(async (req, res) => {
    // Group by day for the last 30 days
    const days = 30;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const orders = await Order.find({
        createdAt: { $gte: dateThreshold },
        isPaid: true
    });

    const purchases = await Purchase.find({
        createdAt: { $gte: dateThreshold },
        isPaid: true
    });

    const expenses = await Expense.find({
        createdAt: { $gte: dateThreshold }
    });

    // Aggregate by date
    const cashFlow = {};

    orders.forEach(order => {
        const date = order.createdAt.toISOString().split('T')[0];
        if (!cashFlow[date]) cashFlow[date] = { date, inflow: 0, outflow: 0 };
        cashFlow[date].inflow += order.totalPrice;
    });

    purchases.forEach(purchase => {
        const date = purchase.createdAt.toISOString().split('T')[0];
        if (!cashFlow[date]) cashFlow[date] = { date, inflow: 0, outflow: 0 };
        cashFlow[date].outflow += purchase.totalCost;
    });

    expenses.forEach(expense => {
        const date = expense.createdAt.toISOString().split('T')[0];
        if (!cashFlow[date]) cashFlow[date] = { date, inflow: 0, outflow: 0 };
        cashFlow[date].outflow += expense.amount;
    });

    const chartData = Object.values(cashFlow).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(chartData);
});

// @desc    Get Receivables (Unpaid Orders)
// @route   GET /api/finance/receivables
// @access  Private/Admin
const getReceivables = asyncHandler(async (req, res) => {
    const unpaidOrders = await Order.find({ isPaid: false })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    const totalReceivables = unpaidOrders.reduce((acc, order) => acc + order.totalPrice, 0);

    res.json({
        total: totalReceivables,
        count: unpaidOrders.length,
        orders: unpaidOrders,
    });
});

// @desc    Get Payables (Unpaid Purchases)
// @route   GET /api/finance/payables
// @access  Private/Admin
const getPayables = asyncHandler(async (req, res) => {
    const unpaidPurchases = await Purchase.find({ isPaid: false })
        .populate('supplier', 'name')
        .sort({ createdAt: -1 });

    const totalPayables = unpaidPurchases.reduce((acc, p) => acc + p.totalCost, 0);

    res.json({
        total: totalPayables,
        count: unpaidPurchases.length,
        purchases: unpaidPurchases,
    });
});

// @desc    Get Aging Report (Overdue Invoices)
// @route   GET /api/finance/aging-report
// @access  Private/Admin
const getAgingReport = asyncHandler(async (req, res) => {
    const unpaidInvoices = await Invoice.find({ status: { $ne: 'Paid' } })
        .populate('customer', 'name')
        .sort({ dueDate: 1 });

    const agingBuckets = {
        '0-30': [],
        '31-60': [],
        '61-90': [],
        '90+': [],
    };

    const today = new Date();

    unpaidInvoices.forEach(invoice => {
        const dueDate = new Date(invoice.dueDate);
        const diffTime = Math.abs(today - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Only count if overdue (dueDate < today)
        if (dueDate < today) {
            if (diffDays <= 30) agingBuckets['0-30'].push(invoice);
            else if (diffDays <= 60) agingBuckets['31-60'].push(invoice);
            else if (diffDays <= 90) agingBuckets['61-90'].push(invoice);
            else agingBuckets['90+'].push(invoice);
        } else {
            // Not overdue yet, maybe add to a 'Current' bucket if needed
            // For now, we focus on overdue
        }
    });

    res.json(agingBuckets);
});

export {
    getFinancialSummary,
    getCashFlow,
    getReceivables,
    getPayables,
    getAgingReport,
};