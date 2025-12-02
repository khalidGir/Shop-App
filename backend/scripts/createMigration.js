#!/usr/bin/env node

// Script to create new migration files
import fs from 'fs';
import path from 'path';

// Get migration name from command line arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name');
  console.log('Usage: node createMigration.js <migration-name>');
  process.exit(1);
}

// Generate timestamp for migration file
const timestamp = Date.now();
const fileName = `${timestamp}-${migrationName}.js`;
const filePath = path.join(process.cwd(), 'migrations', fileName);

// Migration template
const template = `// Migration: ${migrationName}
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

const migrate = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB'.green.bold);
    
    // TODO: Add your migration logic here
    
    console.log('Migration ${migrationName} completed'.green.bold);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:'.red.bold, error);
    process.exit(1);
  }
};

const rollback = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB for rollback'.yellow.bold);
    
    // TODO: Add your rollback logic here
    
    console.log('Rollback ${migrationName} completed'.yellow.bold);
    process.exit(0);
  } catch (error) {
    console.error('Rollback failed:'.red.bold, error);
    process.exit(1);
  }
};

// Check if rollback argument was passed
if (process.argv.includes('rollback')) {
  rollback();
} else {
  migrate();
}
`;

// Write migration file
fs.writeFileSync(filePath, template);

console.log(`Created migration: ${fileName}`.green.bold);
console.log(`Location: ${filePath}`);