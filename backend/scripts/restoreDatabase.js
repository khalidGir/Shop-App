#!/usr/bin/env node

// Database restore script
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

const execPromise = util.promisify(exec);

const restoreDatabase = async (backupFile) => {
  try {
    // Check if backup file is provided
    if (!backupFile) {
      console.error('Please provide a backup file path'.red.bold);
      console.log('Usage: node restoreDatabase.js <path-to-backup-file>');
      process.exit(1);
    }
    
    // Check if backup file exists
    if (!fs.existsSync(backupFile)) {
      console.error(`Backup file not found: ${backupFile}`.red.bold);
      process.exit(1);
    }
    
    // Get MongoDB connection details from environment
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('MONGO_URI not found in environment variables'.red.bold);
      process.exit(1);
    }
    
    // Parse MongoDB URI to get connection details
    const uriParts = mongoUri.match(/^mongodb(?:\+srv)?:\/\/(?:([^:]+):([^@]+)@)?([^\/]+)(?:\/([^?]+))?/);
    
    if (!uriParts) {
      console.error('Invalid MongoDB URI format'.red.bold);
      process.exit(1);
    }
    
    const [, username, password, host, database] = uriParts;
    
    // Build mongorestore command
    let command = `mongorestore --host=${host} --gzip --archive=${backupFile} --drop`;
    
    if (database) {
      command += ` --db=${database}`;
    }
    
    if (username && password) {
      command += ` --username=${username} --password=${password}`;
    }
    
    console.log('Starting database restore...'.blue);
    console.log(`Command: ${command}`);
    
    // Execute restore command
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      console.error('Restore error:', stderr.red);
    }
    
    if (stdout) {
      console.log('Restore output:', stdout);
    }
    
    console.log(`Database restore completed successfully`.green.bold);
    
  } catch (error) {
    console.error('Database restore failed:'.red.bold, error.message);
    process.exit(1);
  }
};

// Get backup file path from command line arguments
const backupFile = process.argv[2];
restoreDatabase(backupFile);