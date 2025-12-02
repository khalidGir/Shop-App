import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import generateToken from '../utils/generateToken.js';

describe('RBAC Verification', () => {
    let ownerToken;
    let salespersonToken;
    let ownerUser;
    let salespersonUser;

    beforeAll(async () => {
        // Connect to DB if not already connected (app might connect, but we need to be sure)
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        }

        // Get Roles
        const ownerRole = await Role.findOne({ name: 'Owner' });
        const salespersonRole = await Role.findOne({ name: 'Salesperson' });

        if (!ownerRole || !salespersonRole) {
            throw new Error('Roles not seeded. Please run seedRoles.js first.');
        }

        // Create Temp Users
        ownerUser = await User.create({
            name: 'Test Owner',
            email: `testowner${Date.now()}@example.com`,
            password: 'password123',
            roles: [ownerRole._id],
        });

        salespersonUser = await User.create({
            name: 'Test Salesperson',
            email: `testsales${Date.now()}@example.com`,
            password: 'password123',
            roles: [salespersonRole._id],
        });

        ownerToken = generateToken(ownerUser._id);
        salespersonToken = generateToken(salespersonUser._id);
    });

    afterAll(async () => {
        // Cleanup
        if (ownerUser) await User.findByIdAndDelete(ownerUser._id);
        if (salespersonUser) await User.findByIdAndDelete(salespersonUser._id);
        await mongoose.connection.close();
    });

    test('Owner should access /api/users (USERS_VIEW)', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${ownerToken}`);

        expect(res.statusCode).toEqual(200);
    });

    test('Salesperson should NOT access /api/users (USERS_VIEW)', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${salespersonToken}`);

        expect(res.statusCode).toEqual(403);
    });

    test('Salesperson should access /api/orders (ORDERS_VIEW)', async () => {
        // Assuming Salesperson has ORDERS_VIEW
        // We need a valid ID for some routes, but let's try a list route if available
        // /api/orders is POST for create, GET for myorders (which is protected but not RBAC specific usually? No, let's check orderRoutes)
        // orderRoutes: router.route('/').post(...). No GET list for all orders.
        // router.route('/myorders').get(protect, getMyOrders); -> This is just protect, so Salesperson should access it.

        const res = await request(app)
            .get('/api/orders/myorders')
            .set('Authorization', `Bearer ${salespersonToken}`);

        expect(res.statusCode).toEqual(200);
    });

    test('Salesperson should access /api/customers (CUSTOMERS_VIEW)', async () => {
        const res = await request(app)
            .get('/api/customers')
            .set('Authorization', `Bearer ${salespersonToken}`);

        expect(res.statusCode).toEqual(200);
    });
});
