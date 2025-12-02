import express from 'express';
const router = express.Router();
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/').get(protect, authorize(PERMISSIONS.SETTINGS_VIEW), getSettings).put(protect, authorize(PERMISSIONS.SETTINGS_UPDATE), updateSettings);

export default router;
