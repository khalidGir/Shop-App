import express from 'express';
const router = express.Router();
import { 
  getFinancialSummary,
  getCashFlow,
  getReceivables,
  getPayables,
  getAgingReport
} from '../controllers/financeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/summary').get(protect, authorize(PERMISSIONS.FINANCE_VIEW), getFinancialSummary);
router.route('/cash-flow').get(protect, authorize(PERMISSIONS.FINANCE_VIEW), getCashFlow);
router.route('/receivables').get(protect, authorize(PERMISSIONS.FINANCE_VIEW), getReceivables);
router.route('/payables').get(protect, authorize(PERMISSIONS.FINANCE_VIEW), getPayables);
router.route('/aging-report').get(protect, authorize(PERMISSIONS.FINANCE_VIEW), getAgingReport);

export default router;