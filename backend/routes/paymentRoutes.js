import express from 'express';
const router = express.Router();
import {
    recordPayment,
    getPayments,
    getCustomerPayments,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/').post(protect, authorize(PERMISSIONS.PAYMENTS_CREATE), recordPayment).get(protect, authorize(PERMISSIONS.PAYMENTS_VIEW), getPayments);
router.route('/customer/:id').get(protect, authorize(PERMISSIONS.PAYMENTS_VIEW), getCustomerPayments);

export default router;
