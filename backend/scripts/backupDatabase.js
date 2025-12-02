#!/usr/bin/env node

// Database backup script
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

const execPromise = util.promisify(exec);

const backupDatabase = async () => {
  try {
    // Create backups directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `shopapp-backup-${timestamp}.gz`;
    const backupPath = path.join(backupDir, backupFileName);
    
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
    
    // Build mongodump command
    let command = `mongodump --host=${host} --gzip --archive=${backupPath}`;
    
    if (database) {
      command += ` --db=${database}`;
    }
    
    if (username && password) {
      command += ` --username=${username} --password=${password}`;
    }
    
    console.log('Starting database backup...'.blue);
    console.log(`Command: ${command}`);
    
    // Execute backup command
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      console.error('Backup error:', stderr.red);
    }
    
    if (stdout) {
      console.log('Backup output:', stdout);
    }
    
    console.log(`Database backup completed successfully`.green.bold);
    console.log(`Backup saved to: ${backupPath}`.green);
    
  } catch (error) {
    console.error('Database backup failed:'.red.bold, error.message);
    process.exit(1);
  }
};

backupDatabase();