import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import generateToken from '../utils/generateToken.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const runVerification = async () => {
    console.log('Starting RBAC Verification...');

    try {
        // Connect to DB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB');
        }

        // Get Roles
        const ownerRole = await Role.findOne({ name: 'Owner' });
        const salespersonRole = await Role.findOne({ name: 'Salesperson' });

        if (!ownerRole || !salespersonRole) {
            throw new Error('Roles not seeded. Please run seedRoles.js first.');
        }

        // Create Temp Users
        const ownerUser = await User.create({
            name: 'Test Owner',
            email: `testowner${Date.now()}@example.com`,
            password: 'password123',
            roles: [ownerRole._id],
        });

        const salespersonUser = await User.create({
            name: 'Test Salesperson',
            email: `testsales${Date.now()}@example.com`,
            password: 'password123',
            roles: [salespersonRole._id],
        });

        const ownerToken = generateToken(ownerUser._id);
        const salespersonToken = generateToken(salespersonUser._id);

        console.log('Temporary users created.');

        // Test 1: Owner accessing Users (Should Pass)
        console.log('Test 1: Owner accessing /api/users...');
        const res1 = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${ownerToken}`);

        if (res1.statusCode === 200) {
            console.log('✅ PASS: Owner can access /api/users');
        } else {
            console.error(`❌ FAIL: Owner cannot access /api/users. Status: ${res1.statusCode}`);
        }

        // Test 2: Salesperson accessing Users (Should Fail)
        console.log('Test 2: Salesperson accessing /api/users...');
        const res2 = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${salespersonToken}`);

        if (res2.statusCode === 403) {
            console.log('✅ PASS: Salesperson correctly denied access to /api/users');
        } else {
            console.error(`❌ FAIL: Salesperson accessed /api/users. Status: ${res2.statusCode}`);
        }

        // Test 3: Salesperson accessing Customers (Should Pass)
        console.log('Test 3: Salesperson accessing /api/customers...');
        const res3 = await request(app)
            .get('/api/customers')
            .set('Authorization', `Bearer ${salespersonToken}`);

        if (res3.statusCode === 200) {
            console.log('✅ PASS: Salesperson can access /api/customers');
        } else {
            console.error(`❌ FAIL: Salesperson cannot access /api/customers. Status: ${res3.statusCode}`);
        }

        // Cleanup
        await User.findByIdAndDelete(ownerUser._id);
        await User.findByIdAndDelete(salespersonUser._id);
        console.log('Cleanup complete.');

    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

runVerification();
