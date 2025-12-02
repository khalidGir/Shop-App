import express from 'express';
const router = express.Router();
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierProducts,
} from '../controllers/supplierController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/').get(protect, authorize(PERMISSIONS.SUPPLIERS_VIEW), getSuppliers).post(protect, authorize(PERMISSIONS.SUPPLIERS_CREATE), createSupplier);

router
  .route('/:id')
  .get(protect, authorize(PERMISSIONS.SUPPLIERS_VIEW), getSupplierById)
  .put(protect, authorize(PERMISSIONS.SUPPLIERS_UPDATE), updateSupplier)
  .delete(protect, authorize(PERMISSIONS.SUPPLIERS_DELETE), deleteSupplier);

router.route('/:id/products').get(protect, authorize(PERMISSIONS.SUPPLIERS_VIEW), getSupplierProducts);

export default router;