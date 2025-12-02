#!/usr/bin/env node

// Script to run database migrations
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const runMigration = async (migrationName) => {
  try {
    const migrationPath = path.join(process.cwd(), 'migrations', migrationName);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file not found: ${migrationPath}`);
      process.exit(1);
    }
    
    console.log(`Running migration: ${migrationName}`);
    
    const { stdout, stderr } = await execPromise(`node ${migrationPath}`);
    
    if (stderr) {
      console.error('Migration error:', stderr);
      process.exit(1);
    }
    
    console.log('Migration output:', stdout);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Failed to run migration:', error);
    process.exit(1);
  }
};

// Get migration name from command line arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration file name');
  console.log('Usage: node runMigration.js <migration-file-name>');
  process.exit(1);
}

runMigration(migrationName);