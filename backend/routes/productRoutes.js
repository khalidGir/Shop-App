import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';
import { validateProduct } from '../middleware/validationMiddleware.js';

// The .route() method allows us to chain HTTP methods on the same route

router.route('/').get(getProducts).post(protect, authorize(PERMISSIONS.PRODUCTS_CREATE), validateProduct, createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize(PERMISSIONS.PRODUCTS_UPDATE), validateProduct, updateProduct)
  .delete(protect, authorize(PERMISSIONS.PRODUCTS_DELETE), deleteProduct);

export default router;