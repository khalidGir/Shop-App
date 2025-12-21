import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Product from '../models/productModels.js';
import Order from '../models/orderModels.js';
import { generateAccessToken } from '../utils/generateToken.js';

describe('Order Controller', () => {
  let user;
  let product1;
  let product2;
  let token;

  beforeAll(async () => {
    // Create a user
    user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    await user.save();

    // Create products
    product1 = new Product({
      name: 'Test Product 1',
      price: 10,
      countInStock: 100,
      unitType: 'pcs',
    });
    await product1.save();

    product2 = new Product({
      name: 'Test Product 2',
      price: 20,
      countInStock: 50,
      unitType: 'pcs',
    });
    await product2.save();

    // Generate a token for the user
    token = generateAccessToken(user._id);
  });

  describe('POST /api/orders', () => {
    it('should create a new order without a discount', async () => {
      const orderItems = [
        { _id: product1._id, qty: 2 },
        { _id: product2._id, qty: 1 },
      ];

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderItems,
          shippingAddress: { address: '123 Main St', city: 'Anytown' },
          paymentMethod: 'PayPal',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.orderItems.length).toBe(2);
      expect(res.body.itemsPrice).toBe(40); // (10 * 2) + (20 * 1)
      expect(res.body.taxPrice).toBe(6); // 40 * 0.15
      expect(res.body.shippingPrice).toBe(10); // itemsPrice is < 100
      expect(res.body.totalPrice).toBe(56); // 40 + 6 + 10
    });

    it('should create a new order with a discount', async () => {
      const orderItems = [
        { _id: product1._id, qty: 5 },
        { _id: product2._id, qty: 3 },
      ];

      const res = await request(app)
.
.

