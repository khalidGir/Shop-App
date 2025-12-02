import express from 'express';
const router = express.Router();
import {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoiceFromOrder,
} from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../utils/permissions.js';

router.route('/').get(protect, authorize(PERMISSIONS.INVOICES_VIEW), getInvoices).post(protect, authorize(PERMISSIONS.INVOICES_CREATE), createInvoice);
router
    .route('/:id')
    .get(protect, authorize(PERMISSIONS.INVOICES_VIEW), getInvoiceById)
    .put(protect, authorize(PERMISSIONS.INVOICES_UPDATE), updateInvoice)
    .delete(protect, authorize(PERMISSIONS.INVOICES_DELETE), deleteInvoice);
router.route('/generate/:orderId').post(protect, authorize(PERMISSIONS.INVOICES_CREATE), generateInvoiceFromOrder);

export default router;
