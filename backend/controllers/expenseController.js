import asyncHandler from 'express-async-handler';
import Expense from '../models/expenseModel.js';

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private/Admin
const addExpense = asyncHandler(async (req, res) => {
  const { description, amount, category, expenseDate } = req.body;

  const expense = new Expense({
    user: req.user._id,
    description,
    amount,
    category,
    expenseDate,
  });

  const createdExpense = await expense.save();
  res.status(201).json(createdExpense);
});

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private/Admin
const getExpenses = asyncHandler(async (req, res) => {
  // We can add filtering by category or date later if needed
  const expenses = await Expense.find({}).populate('user', 'name');
  res.json(expenses);
});

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private/Admin
const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id).populate('user', 'name');

  if (expense) {
    res.json(expense);
  } else {
    res.status(404);
    throw new Error('Expense not found');
  }
});

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private/Admin
const updateExpense = asyncHandler(async (req, res) => {
  const { description, amount, category, expenseDate } = req.body;

  const expense = await Expense.findById(req.params.id);

  if (expense) {
    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.expenseDate = expenseDate || expense.expenseDate;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } else {
    res.status(404);
    throw new Error('Expense not found');
  }
});

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (expense) {
    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } else {
    res.status(404);
    throw new Error('Expense not found');
  }
});

export {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};