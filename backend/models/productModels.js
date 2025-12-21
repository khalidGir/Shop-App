import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    unitType: {
      type: String,
      required: true,
      enum: ['pcs', 'm', 'kg'],
      default: 'pcs',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: false,
    },
    minStock: {
      type: Number,
      required: false,
      default: 0,
    },
    reorderPoint: {
      type: Number,
      required: false,
      default: 10,
    },
    reorderQuantity: {
      type: Number,
      required: false,
      default: 50,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
