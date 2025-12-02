import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';

/**
 * @desc    Generate 2FA secret and QR code
 * @route   POST /api/auth/2fa/setup
 * @access  Private
 */
const generate2FASecret = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Generate a secret
  const secret = speakeasy.generateSecret({
    name: `ShopApp (${user.email})`,
    issuer: 'ShopApp',
  });

  // Generate QR code URL
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  // Save the secret to the user (but don't enable 2FA yet)
  user.twoFactorSecret = secret.ascii;
  await user.save();

  res.json({
    secret: secret.base32,
    qrCode: qrCodeUrl,
  });
});

/**
 * @desc    Verify 2FA token and enable 2FA
 * @route   POST /api/auth/2fa/verify
 * @access  Private
 */
const verify2FAToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.twoFactorSecret) {
    res.status(400);
    throw new Error('2FA setup not initiated');
  }

  // Verify the token
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'ascii',
    token,
    window: 2, // Allow a small window for time differences
  });

  if (verified) {
    user.isTwoFactorEnabled = true;

    // Generate plaintext backup codes to return to the user
    const plaintextBackupCodes = Array.from({ length: 10 }, () => 
      Math.floor(100000 + Math.random() * 900000).toString()
    );

    // Hash the backup codes before saving
    const saltRounds = 10;
    const hashedBackupCodes = await Promise.all(
      plaintextBackupCodes.map(code => bcrypt.hash(code, saltRounds))
    );
    
    user.backupCodes = hashedBackupCodes;
    await user.save();

    res.json({
      success: true,
      message: '2FA enabled successfully. Please save your backup codes.',
      backupCodes: plaintextBackupCodes, // Return plaintext codes to user
    });
  } else {
    res.status(400);
    throw new Error('Invalid 2FA token');
  }
});

/**
 * @desc    Disable 2FA
 * @route   POST /api/auth/2fa/disable
 * @access  Private
 */
const disable2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isTwoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.backupCodes = undefined;
  await user.save();

  res.json({
    success: true,
    message: '2FA disabled successfully',
  });
});

/**
 * @desc    Verify 2FA during login
 * @route   POST /api/auth/2fa/authenticate
 * @access  Public
 */
const authenticate2FA = asyncHandler(async (req, res) => {
  const { email, password, token } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Check if 2FA is enabled
    if (!user.isTwoFactorEnabled) {
      res.status(400);
      throw new Error('2FA not enabled for this user');
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'ascii',
      token,
      window: 2,
    });

    if (verified) {
      const userWithRoles = await User.findById(user._id).populate('roles');
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        roles: userWithRoles.roles,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid 2FA token');
    }
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Verify backup code for 2FA recovery
 * @route   POST /api/auth/2fa/verify-backup
 * @access  Public
 */
const verifyBackupCode = asyncHandler(async (req, res) => {
  const { email, password, code } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isTwoFactorEnabled) {
      res.status(400);
      throw new Error('2FA not enabled for this user');
    }
    if (!user.backupCodes || user.backupCodes.length === 0) {
      res.status(400);
      throw new Error('No backup codes available');
    }

    let codeMatch = false;
    let usedCodeIndex = -1;

    for (let i = 0; i < user.backupCodes.length; i++) {
      const match = await bcrypt.compare(code, user.backupCodes[i]);
      if (match) {
        codeMatch = true;
        usedCodeIndex = i;
        break;
      }
    }
    
    if (codeMatch) {
      // Invalidate the used backup code
      user.backupCodes.splice(usedCodeIndex, 1);
      await user.save();

      const userWithRoles = await User.findById(user._id).populate('roles');
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        roles: userWithRoles.roles,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid backup code');
    }
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// Need to import the generateToken function
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Regenerate backup codes for 2FA
 * @route   POST /api/auth/2fa/regenerate-codes
 * @access  Private
 */
const regenerateBackupCodes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.isTwoFactorEnabled) {
    res.status(400);
    throw new Error('2FA is not enabled for this account.');
  }

  // Generate plaintext backup codes to return to the user
  const plaintextBackupCodes = Array.from({ length: 10 }, () => 
    Math.floor(100000 + Math.random() * 900000).toString()
  );

  // Hash the backup codes before saving
  const saltRounds = 10;
  const hashedBackupCodes = await Promise.all(
    plaintextBackupCodes.map(code => bcrypt.hash(code, saltRounds))
  );
  
  user.backupCodes = hashedBackupCodes;
  await user.save();

  res.json({
    success: true,
    message: 'New backup codes generated successfully. Please save them securely.',
    backupCodes: plaintextBackupCodes,
  });
});


export { 
  generate2FASecret, 
  verify2FAToken, 
  disable2FA, 
  authenticate2FA,
  verifyBackupCode,
  regenerateBackupCodes
};