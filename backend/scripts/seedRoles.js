// backend/scripts/seedRoles.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Role from '../models/roleModel.js';
import { PERMISSIONS } from '../utils/permissions.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedRoles = async () => {
  await connectDB();

  try {
    // Clear existing roles to avoid duplicates
    await Role.deleteMany({});
    console.log('Old roles cleared.');

    const allPermissions = Object.values(PERMISSIONS);

    const salespersonPermissions = [
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.ORDERS_CREATE,
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.SUPPLIERS_VIEW, // <--- ADD THIS PERMISSION
      PERMISSIONS.QUOTES_CREATE,
      PERMISSIONS.QUOTES_VIEW,
      PERMISSIONS.UPLOADS_CREATE,
    ];

    const roles = [
      {
        name: 'Owner',
        permissions: allPermissions,
      },
      {
        name: 'Salesperson',
        permissions: salespersonPermissions,
      },
      {
        name: 'Inventory Manager',
        permissions: [
          PERMISSIONS.PRODUCTS_CREATE,
          PERMISSIONS.PRODUCTS_VIEW,
          PERMISSIONS.PRODUCTS_UPDATE,
          PERMISSIONS.SUPPLIERS_CREATE,
          PERMISSIONS.SUPPLIERS_VIEW,
          PERMISSIONS.SUPPLIERS_UPDATE,
          PERMISSIONS.PURCHASES_CREATE,
          PERMISSIONS.PURCHASES_VIEW,
          PERMISSIONS.INVENTORY_VIEW,
          PERMISSIONS.INVENTORY_MANAGE,
          PERMISSIONS.STOCK_MOVEMENTS_VIEW,
          PERMISSIONS.STOCK_MOVEMENTS_CREATE,
          PERMISSIONS.UPLOADS_CREATE,
        ],
      },
    ];

    await Role.insertMany(roles);
    console.log('Roles have been successfully seeded!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding roles: ${error.message}`);
    process.exit(1);
  }
};

/**
 * To run this script:
 * 1. Make sure you have a .env file in the 'backend' directory with your MONGODB_URI.
 * 2. Run the command: node backend/scripts/seedRoles.js
 *
 * This will DELETE all existing roles and create the new ones defined above.
 */
seedRoles();