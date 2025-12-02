import asyncHandler from 'express-async-handler';
import Supplier from '../models/supplierModel.js';
import Product from '../models/productModels.js';

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({}).populate('createdBy', 'name');
  res.json(suppliers);
});

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id).populate('createdBy', 'name');

  if (supplier) {
    res.json(supplier);
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private
const createSupplier = asyncHandler(async (req, res) => {
  const { name, contactPerson, email, phone, address, city, country, notes } = req.body;

  const supplierExists = await Supplier.findOne({ email });

  if (supplierExists) {
    res.status(400);
    throw new Error('Supplier with this email already exists');
  }

  const supplier = new Supplier({
    name,
    contactPerson,
    email,
    phone,
    address,
    city,
    country: country || 'Ethiopia',
    notes,
    createdBy: req.user._id,
  });

  const createdSupplier = await supplier.save();
  res.status(201).json(createdSupplier);
});

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = asyncHandler(async (req, res) => {
  const { name, contactPerson, email, phone, address, city, country, notes } = req.body;

  const supplier = await Supplier.findById(req.params.id);

  if (supplier) {
    supplier.name = name || supplier.name;
    supplier.contactPerson = contactPerson || supplier.contactPerson;
    supplier.email = email || supplier.email;
    supplier.phone = phone || supplier.phone;
    supplier.address = address || supplier.address;
    supplier.city = city || supplier.city;
    supplier.country = country || supplier.country;
    supplier.notes = notes !== undefined ? notes : supplier.notes;

    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (supplier) {
    // Check if supplier has products
    const products = await Product.find({ supplier: supplier._id });
    if (products.length > 0) {
      res.status(400);
      throw new Error('Cannot delete supplier with linked products');
    }

    await supplier.deleteOne();
    res.json({ message: 'Supplier removed' });
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

// @desc    Get supplier's products
// @route   GET /api/suppliers/:id/products
// @access  Private
const getSupplierProducts = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }

  const products = await Product.find({ supplier: req.params.id });
  res.json(products);
});

export {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierProducts,
};
