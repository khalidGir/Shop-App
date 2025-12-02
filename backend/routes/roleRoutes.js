import express from 'express';
const router = express.Router();
import { createRole, getRoles, updateRole } from '../controllers/roleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/').post(protect, authorize(PERMISSIONS.ROLES_CREATE), createRole).get(protect, authorize(PERMISSIONS.ROLES_VIEW), getRoles);
router.route('/:id').put(protect, authorize(PERMISSIONS.ROLES_UPDATE), updateRole);

export default router;
