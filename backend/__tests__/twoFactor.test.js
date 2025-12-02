import request from 'supertest';
import express from 'express';
import twoFactorRoutes from '../routes/twoFactorRoutes.js';

// Mock the controllers
jest.unstable_mockModule('../controllers/twoFactorController.js', () => ({
  generate2FASecret: (req, res) => res.status(200).json({ 
    secret: 'JBSWY3DPEHPK3PXP', 
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACCCAMAAADQNkiAAAAA1BMVEW10NBjBBbqAAAAH0lEQVRo3u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIBLcQ8AAa0jZQAAAABJRU5ErkJggg==' 
  }),
  verify2FAToken: (req, res) => res.status(200).json({ 
    success: true, 
    message: '2FA enabled successfully',
    backupCodes: ['123456', '789012', '345678']
  }),
  disable2FA: (req, res) => res.status(200).json({ 
    success: true, 
    message: '2FA disabled successfully' 
  }),
  authenticate2FA: (req, res) => res.status(200).json({ 
    _id: 'user-id', 
    name: 'Test User', 
    email: 'test@example.com',
    token: 'fake-jwt-token'
  })
}));

// Mock the auth middleware
jest.unstable_mockModule('../middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => {
    // Check if authorization header exists
    if (!req.headers.authorization) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
    
    // Check if token is in the right format
    if (!req.headers.authorization.startsWith('Bearer')) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
    
    // Mock user object
    req.user = { _id: 'user-id' };
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/api/auth/2fa', twoFactorRoutes);

describe('2FA Routes', () => {
  describe('POST /api/auth/2fa/setup', () => {
    it('should generate 2FA secret and QR code', async () => {
      const res = await request(app)
        .post('/api/auth/2fa/setup')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('secret');
      expect(res.body).toHaveProperty('qrCode');
    });
  });

  describe('POST /api/auth/2fa/verify', () => {
    it('should verify 2FA token and enable 2FA', async () => {
      const res = await request(app)
        .post('/api/auth/2fa/verify')
        .set('Authorization', 'Bearer fake-token')
        .send({
          token: '123456'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('backupCodes');
    });
  });

  describe('POST /api/auth/2fa/disable', () => {
    it('should disable 2FA', async () => {
      const res = await request(app)
        .post('/api/auth/2fa/disable')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/2fa/authenticate', () => {
    it('should authenticate user with 2FA token', async () => {
      const res = await request(app)
        .post('/api/auth/2fa/authenticate')
        .send({
          email: 'test@example.com',
          password: 'password123',
          token: '123456'
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('token');
    }, 10000); // Increase timeout for this test
  });
});