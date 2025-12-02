import express from 'express';
const router = express.Router();
import {
    getLowStockAlerts,
    getReorderSuggestions,
    getStockTurnover,
    getInventoryValue,
    getStockLevels,
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/low-stock').get(protect, authorize(PERMISSIONS.INVENTORY_VIEW), getLowStockAlerts);
router.route('/reorder-suggestions').get(protect, authorize(PERMISSIONS.INVENTORY_VIEW), getReorderSuggestions);
router.route('/turnover').get(protect, authorize(PERMISSIONS.INVENTORY_VIEW), getStockTurnover);
router.route('/value').get(protect, authorize(PERMISSIONS.INVENTORY_VIEW), getInventoryValue);
router.route('/stock-levels').get(protect, authorize(PERMISSIONS.INVENTORY_VIEW), getStockLevels);

export default router;
