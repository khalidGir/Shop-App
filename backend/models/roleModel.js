import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    permissions: {
      type: [String],
      required: true,
      default: [], // e.g., ['manage_products', 'view_orders']
    },
  },
  { timestamps: true }
);

const Role = mongoose.model('Role', roleSchema);

export default Role;
