
import request from 'supertest';
import app from '../server.js';
// jest.setup.js handles DB connection/teardown automatically

describe('End-to-End User Flow', () => {

    it('Should complete the full user flow (Register -> Product -> Order)', async () => {
        // 1. REGISTER
        const testUser = {
            name: 'Flow User',
            email: `flow_${Date.now()}@example.com`,
            password: 'password123'
        };

        const regRes = await request(app)
            .post('/api/users')
            .send(testUser);

        expect(regRes.statusCode).toBe(201);
        expect(regRes.body).toHaveProperty('accessToken');

        let token = regRes.body.accessToken;
        let userId = regRes.body._id;

        // 2. MAKE ADMIN (Required for RBAC)
        // We must create a Role with permissions and assign it to the user
        // because middleware checks req.user.roles.permissions
        const User = (await import('../models/userModel.js')).default;
        const Role = (await import('../models/roleModel.js')).default;
        // Import PERMISSIONS to be safe or just use strings

        const adminRole = await Role.create({
            name: 'Super Admin',
            permissions: [
                'products:create',
                'products:view',
                'orders:create',
                'orders:view'
            ]
        });

        await User.findByIdAndUpdate(userId, {
            isAdmin: true,
            roles: [adminRole._id]
        });

        // 3. CREATE PRODUCT
        const productData = {
            name: 'Flow Product',
            price: '99.99', // String to match our fixed test expectation/mock validation
            brand: 'Flow Brand',
            category: 'Flow Category',
            countInStock: 10,
            description: 'Flow Description'
        };

        const prodRes = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send(productData);

        expect(prodRes.statusCode).toBe(201);
        expect(prodRes.body).toHaveProperty('_id');
        const productId = prodRes.body._id;

        // 4. CREATE ORDER
        const orderData = {
            orderItems: [{
                name: 'Flow Product',
                qty: 1,
                image: '/sample.jpg',
                price: 99.99,
                product: productId,
                _id: productId // Controller expects _id to be present
            }],
            shippingAddress: {
                address: '123 Flow St',
                city: 'Flow City',
                postalCode: '12345',
                country: 'Flow Country'
            },
            paymentMethod: 'PayPal',
            itemsPrice: 99.99,
            shippingPrice: 0,
            taxPrice: 0,
            totalPrice: 99.99
        };

        const orderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send(orderData);

        expect(orderRes.statusCode).toBe(201);
        expect(orderRes.body).toHaveProperty('_id');
        const orderId = orderRes.body._id;

        // 5. GET ORDER DETAILS
        const getOrderRes = await request(app)
            .get(`/api/orders/${orderId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getOrderRes.statusCode).toBe(200);
        expect(getOrderRes.body).toHaveProperty('_id', orderId);
    });
});
