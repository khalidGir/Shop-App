import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  unit: { type: String, enum: ['pcs', 'm', 'kg'], default: 'pcs' },
  buyingPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
