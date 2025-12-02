import express from 'express';
const router = express.Router();
import { 
  generate2FASecret, 
  verify2FAToken, 
  disable2FA,
  authenticate2FA,
  verifyBackupCode,
  regenerateBackupCodes
} from '../controllers/twoFactorController.js';
import { protect } from '../middleware/authMiddleware.js';

/**
 * @swagger
 * tags:
 *   name: 2FA
 *   description: Two-factor authentication
 */

/**
 * @swagger
 * /auth/2fa/setup:
 *   post:
 *     summary: Generate 2FA secret and QR code
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA secret and QR code generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secret:
 *                   type: string
 *                 qrCode:
 *                   type: string
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.route('/setup').post(protect, generate2FASecret);

/**
 * @swagger
 * /auth/2fa/verify:
 *   post:
 *     summary: Verify 2FA token and enable 2FA
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit 2FA token
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 backupCodes:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid token
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.route('/verify').post(protect, verify2FAToken);

/**
 * @swagger
 * /auth/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.route('/disable').post(protect, disable2FA);

/**
 * @swagger
 * /auth/2fa/authenticate:
 *   post:
 *     summary: Authenticate user with 2FA token
 *     tags: [2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               token:
 *                 type: string
 *                 description: 6-digit 2FA token
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: 2FA not enabled
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.route('/authenticate').post(authenticate2FA);

/**
 * @swagger
 * /auth/2fa/verify-backup:
 *   post:
 *     summary: Verify backup code for 2FA recovery
 *     tags: [2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               code:
 *                 type: string
 *                 description: 6-digit backup code
 *     responses:
 *       200:
 *         description: User authenticated successfully with backup code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: 2FA not enabled or no backup codes available
 *       401:
 *         description: Invalid credentials or backup code
 *       500:
 *         description: Server error
 */
router.route('/verify-backup').post(verifyBackupCode);

/**
 * @swagger
 * /auth/2fa/regenerate-codes:
 *   post:
 *     summary: Regenerate backup codes for 2FA
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New backup codes generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 backupCodes:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: 2FA not enabled
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.route('/regenerate-codes').post(protect, regenerateBackupCodes);

export default router;