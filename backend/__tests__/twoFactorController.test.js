// Mock dependencies
jest.mock('speakeasy');
jest.mock('qrcode');
jest.mock('bcryptjs');
jest.mock('../models/userModel.js');
jest.mock('../utils/generateToken.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// Import controller functions
import {
  generate2FASecret,
  verify2FAToken,
  disable2FA,
  authenticate2FA,
  verifyBackupCode,
  regenerateBackupCodes
} from '../controllers/twoFactorController.js';

describe('2FA Controller', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      user: { _id: 'user-id' },
      body: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('generate2FASecret', () => {
    it('should generate 2FA secret and QR code', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(mockUser);

      speakeasy.generateSecret.mockReturnValue({
        ascii: 'secret-ascii',
        base32: 'secret-base32',
        otpauth_url: 'otpauth://totp/ShopApp:test@example.com?secret=secret-base32&issuer=ShopApp'
      });

      QRCode.toDataURL.mockResolvedValue('data:image/png;base64,fake-qr-code');

      await generate2FASecret(mockRequest, mockResponse, mockNext);

      expect(User.findById).toHaveBeenCalledWith('user-id');
      expect(speakeasy.generateSecret).toHaveBeenCalled();
      expect(QRCode.toDataURL).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        secret: 'secret-base32',
        qrCode: 'data:image/png;base64,fake-qr-code'
      });
    });
  });

  describe('verify2FAToken', () => {
    it('should verify token, enable 2FA, and generate hashed backup codes', async () => {
      mockRequest.body.token = '123456';

      const mockUser = {
        _id: 'user-id',
        twoFactorSecret: 'secret-ascii',
        isTwoFactorEnabled: false,
        save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(mockUser);

      speakeasy.totp.verify.mockReturnValue(true);
      bcrypt.hash.mockResolvedValue('hashed-code');

      await verify2FAToken(mockRequest, mockResponse, mockNext);

      expect(User.findById).toHaveBeenCalledWith('user-id');
      expect(speakeasy.totp.verify).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledTimes(10);
      expect(mockUser.isTwoFactorEnabled).toBe(true);
      expect(mockUser.backupCodes).toHaveLength(10);
      expect(mockUser.backupCodes[0]).toBe('hashed-code');
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.any(String),
        backupCodes: expect.any(Array)
      }));
      // expect(mockResponse.json.mock.calls[0][0].backupCodes[0]).not.toBe('hashed-code');
    });
  });

  describe('disable2FA', () => {
    it('should disable 2FA', async () => {
      const mockUser = {
        _id: 'user-id',
        isTwoFactorEnabled: true,
        twoFactorSecret: 'secret-ascii',
        backupCodes: ['hashed-code'],
        save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(mockUser);

      await disable2FA(mockRequest, mockResponse, mockNext);

      expect(User.findById).toHaveBeenCalledWith('user-id');
      expect(mockUser.isTwoFactorEnabled).toBe(false);
      expect(mockUser.twoFactorSecret).toBeUndefined();
      expect(mockUser.backupCodes).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '2FA disabled successfully'
      });
    });
  });

  describe('authenticate2FA', () => {
    it('should authenticate user with a valid 2FA token', async () => {
      mockRequest.body = { email: 'test@example.com', password: 'password123', token: '123456' };

      const mockUser = {
        _id: 'user-id',
        isTwoFactorEnabled: true,
        twoFactorSecret: 'secret-ascii',
        matchPassword: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
        roles: []
      };
      User.findOne.mockResolvedValue(mockUser);
      User.findById.mockResolvedValue(mockUser);
      speakeasy.totp.verify.mockReturnValue(true);
      generateToken.mockReturnValue('fake-jwt-token');

      await authenticate2FA(mockRequest, mockResponse, mockNext);

      expect(speakeasy.totp.verify).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalledWith('user-id');
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'fake-jwt-token' }));
    });
  });

  describe('verifyBackupCode', () => {
    it('should authenticate user with a valid backup code and invalidate it', async () => {
      mockRequest.body = { email: 'test@example.com', password: 'password123', code: '123456' };

      const mockUser = {
        _id: 'user-id',
        isTwoFactorEnabled: true,
        backupCodes: ['hashed-code-1', 'hashed-code-2'],
        matchPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
        roles: []
      };
      User.findOne.mockResolvedValue(mockUser);
      User.findById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true); // Match the first code
      generateToken.mockReturnValue('fake-jwt-token');

      await verifyBackupCode(mockRequest, mockResponse, mockNext);

      expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashed-code-1');
      expect(mockUser.backupCodes).toEqual(['hashed-code-2']);
      expect(mockUser.save).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalledWith('user-id');
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'fake-jwt-token' }));
    });

    it('should return 401 for an invalid backup code', async () => {
      mockRequest.body = { email: 'test@example.com', password: 'password123', code: 'wrong-code' };

      const mockUser = {
        isTwoFactorEnabled: true,
        backupCodes: ['hashed-code-1'],
        matchPassword: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await verifyBackupCode(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalledWith(new Error('Invalid backup code'));
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should generate a new set of backup codes for an authenticated user', async () => {
      const mockUser = {
        _id: 'user-id',
        isTwoFactorEnabled: true,
        backupCodes: ['old-hashed-code'],
        save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue('new-hashed-code');

      await regenerateBackupCodes(mockRequest, mockResponse, mockNext);

      expect(User.findById).toHaveBeenCalledWith('user-id');
      expect(bcrypt.hash).toHaveBeenCalledTimes(10);
      expect(mockUser.backupCodes).toHaveLength(10);
      expect(mockUser.backupCodes[0]).toBe('new-hashed-code');
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        backupCodes: expect.any(Array)
      }));
    });

    it('should return 400 if 2FA is not enabled', async () => {
      const mockUser = { isTwoFactorEnabled: false };
      User.findById.mockResolvedValue(mockUser);

      await regenerateBackupCodes(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).toHaveBeenCalledWith(new Error('2FA is not enabled for this account.'));
    });
  });
});