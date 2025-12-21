
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Set NODE_ENV to test to prevent server.js from auto-connecting
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_123';

const start = async () => {
    try {
        console.log('Starting In-Memory MongoDB...');
        const mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();

        console.log(`Connecting to In-Memory DB: ${uri}`);
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to In-Memory DB');

        // Dynamic import to enforce execution order after ENV is set
        const { default: app } = await import('../server.js');

        const PORT = 5001;
        app.listen(PORT, () => {
            console.log(`Test Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
