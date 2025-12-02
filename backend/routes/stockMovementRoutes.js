import express from 'express';
const router = express.Router();
import {
    getStockMovements,
    getProductStockMovements,
    createStockMovement,
    getRecentMovements,
} from '../controllers/stockMovementController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/').get(protect, authorize(PERMISSIONS.STOCK_MOVEMENTS_VIEW), getStockMovements).post(protect, authorize(PERMISSIONS.STOCK_MOVEMENTS_CREATE), createStockMovement);
router.route('/recent').get(protect, authorize(PERMISSIONS.STOCK_MOVEMENTS_VIEW), getRecentMovements);
router.route('/product/:id').get(protect, authorize(PERMISSIONS.STOCK_MOVEMENTS_VIEW), getProductStockMovements);

export default router;
