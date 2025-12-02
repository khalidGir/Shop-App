import express from 'express';
const router = express.Router();
import {
    getPurchases,
    getPurchaseById,
    createPurchase,
    updatePurchase,
    deletePurchase,
    receivePurchase,
} from '../controllers/purchaseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/').get(protect, authorize(PERMISSIONS.PURCHASES_VIEW), getPurchases).post(protect, authorize(PERMISSIONS.PURCHASES_CREATE), createPurchase);

router
    .route('/:id')
    .get(protect, authorize(PERMISSIONS.PURCHASES_VIEW), getPurchaseById)
    .put(protect, authorize(PERMISSIONS.PURCHASES_UPDATE), updatePurchase)
    .delete(protect, authorize(PERMISSIONS.PURCHASES_DELETE), deletePurchase);

router.route('/:id/receive').put(protect, authorize(PERMISSIONS.PURCHASES_UPDATE), receivePurchase);

export default router;
