import express from 'express';
const router = express.Router();
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

import { PERMISSIONS } from '../utils/permissions.js';

router.route('/').get(protect, authorize(PERMISSIONS.DASHBOARD_VIEW), getDashboardSummary);

export default router;
