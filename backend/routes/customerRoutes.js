import express from 'express';
const router = express.Router();
import {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerOrders,
} from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/').get(protect, authorize(PERMISSIONS.CUSTOMERS_VIEW), getCustomers).post(protect, authorize(PERMISSIONS.CUSTOMERS_CREATE), createCustomer);

router
    .route('/:id')
    .get(protect, authorize(PERMISSIONS.CUSTOMERS_VIEW), getCustomerById)
    .put(protect, authorize(PERMISSIONS.CUSTOMERS_UPDATE), updateCustomer)
    .delete(protect, authorize(PERMISSIONS.CUSTOMERS_DELETE), deleteCustomer);

router.route('/:id/orders').get(protect, authorize(PERMISSIONS.CUSTOMERS_VIEW), getCustomerOrders);

export default router;
