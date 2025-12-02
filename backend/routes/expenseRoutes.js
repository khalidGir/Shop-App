import express from 'express';
const router = express.Router();
import {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/').get(protect, authorize(PERMISSIONS.EXPENSES_VIEW), getExpenses).post(protect, authorize(PERMISSIONS.EXPENSES_CREATE), addExpense);
router
  .route('/:id')
  .get(protect, authorize(PERMISSIONS.EXPENSES_VIEW), getExpenseById)
  .put(protect, authorize(PERMISSIONS.EXPENSES_UPDATE), updateExpense)
  .delete(protect, authorize(PERMISSIONS.EXPENSES_DELETE), deleteExpense);

export default router;