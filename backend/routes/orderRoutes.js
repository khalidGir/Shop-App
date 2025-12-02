import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/').post(protect, authorize(PERMISSIONS.ORDERS_CREATE), addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, authorize(PERMISSIONS.ORDERS_VIEW), getOrderById);
router.route('/:id/pay').put(protect, authorize(PERMISSIONS.ORDERS_UPDATE), updateOrderToPaid);

export default router;