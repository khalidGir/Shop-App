import express from 'express';
const router = express.Router();
import {
  addQuote,
  getQuotes,
  getQuoteById,
  convertQuoteToOrder,
} from '../controllers/quoteController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/').get(protect, authorize(PERMISSIONS.QUOTES_VIEW), getQuotes).post(protect, authorize(PERMISSIONS.QUOTES_CREATE), addQuote);
router.route('/:id').get(protect, authorize(PERMISSIONS.QUOTES_VIEW), getQuoteById);
router.route('/:id/convert').post(protect, authorize(PERMISSIONS.QUOTES_UPDATE, PERMISSIONS.ORDERS_CREATE), convertQuoteToOrder);

export default router;