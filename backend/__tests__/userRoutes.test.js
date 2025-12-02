import request from 'supertest';
import express from 'express';
import userRoutes from '../routes/userRoutes.js';

// Mock the controllers
jest.unstable_mockModule('../controllers/userController.js', () => ({
  authUser: (req, res) => res.status(200).json({ token: 'fake-token' }),
  registerUser: (req, res) => res.status(201).json({ _id: 'user-id', name: 'Test User', email: 'test@example.com' }),
  getUsers: (req, res) => res.status(200).json([{ _id: 'user-id', name: 'Test User', email: 'test@example.com' }]),
  deleteUser: (req, res) => res.status(200).json({ message: 'User removed' }),
  getUserById: (req, res) => res.status(200).json({ _id: 'user-id', name: 'Test User', email: 'test@example.com' }),
  updateUser: (req, res) => res.status(200).json({ _id: 'user-id', name: 'Updated User', email: 'test@example.com' }),
  updateUserProfile: (req, res) => res.status(200).json({ _id: 'user-id', name: 'Updated User', email: 'test@example.com' }),
}));

// Mock the auth middleware
jest.unstable_mockModule('../middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => next(),
  authorize: () => (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes', () => {
  describe('POST /api/users/login', () => {
    it('should login a user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('POST /api/users', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('email');
    });
  });
});