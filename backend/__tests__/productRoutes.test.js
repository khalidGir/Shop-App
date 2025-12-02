import request from 'supertest';
import express from 'express';
import productRoutes from '../routes/productRoutes.js';

// Mock the controllers
jest.mock('../controllers/productController.js', () => ({
  getProducts: (req, res) => res.status(200).json([
    { 
      _id: '1', 
      name: 'Test Product', 
      price: 29.99,
      countInStock: 10
    }
  ]),
  getProductById: (req, res) => res.status(200).json({ 
    _id: '1', 
    name: 'Test Product', 
    price: 29.99,
    countInStock: 10
  }),
  createProduct: (req, res) => res.status(201).json({ 
    _id: '2', 
    name: req.body.name, 
    price: req.body.price,
    countInStock: req.body.countInStock
  }),
  updateProduct: (req, res) => res.status(200).json({ 
    _id: '1', 
    name: req.body.name || 'Test Product', 
    price: req.body.price || 29.99,
    countInStock: req.body.countInStock || 10
  }),
  deleteProduct: (req, res) => res.status(200).json({ message: 'Product removed' })
}));

// Mock the auth middleware
jest.mock('../middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => next(),
  authorize: () => (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Product Routes', () => {
  describe('GET /api/products', () => {
    it('should fetch products', async () => {
      const res = await request(app).get('/api/products');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body[0]).toHaveProperty('_id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('price');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should fetch a single product', async () => {
      const res = await request(app).get('/api/products/1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', '1');
      expect(res.body).toHaveProperty('name', 'Test Product');
      expect(res.body).toHaveProperty('price', 29.99);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product with valid data', async () => {
      const productData = {
        name: 'New Product',
        price: 49.99,
        countInStock: 5
      };

      const res = await request(app)
        .post('/api/products')
        .send(productData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'New Product');
      expect(res.body).toHaveProperty('price', 49.99);
      expect(res.body).toHaveProperty('countInStock', 5);
    });

    it('should fail to create product with invalid data', async () => {
      const productData = {
        name: '',
        price: 'invalid',
        countInStock: 'invalid'
      };

      const res = await request(app)
        .post('/api/products')
        .send(productData);
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update an existing product', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 39.99
      };

      const res = await request(app)
        .put('/api/products/1')
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', '1');
      expect(res.body).toHaveProperty('name', 'Updated Product');
      expect(res.body).toHaveProperty('price', 39.99);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const res = await request(app)
        .delete('/api/products/1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Product removed');
    });
  });
});