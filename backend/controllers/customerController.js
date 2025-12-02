import asyncHandler from 'express-async-handler';
import Customer from '../models/customerModel.js';
import Order from '../models/orderModels.js';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
    const customers = await Customer.find({}).populate('createdBy', 'name');
    res.json(customers);
});

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id).populate('createdBy', 'name');

    if (customer) {
        res.json(customer);
    } else {
        res.status(404);
        throw new Error('Customer not found');
    }
});

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
    const { name, email, phone, address, city, postalCode, country, notes } = req.body;

    const customerExists = await Customer.findOne({ email });

    if (customerExists) {
        res.status(400);
        throw new Error('Customer with this email already exists');
    }

    const customer = new Customer({
        name,
        email,
        phone,
        address,
        city,
        postalCode,
        country: country || 'Ethiopia',
        notes,
        createdBy: req.user._id,
    });

    const createdCustomer = await customer.save();
    res.status(201).json(createdCustomer);
});

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
    const { name, email, phone, address, city, postalCode, country, notes } = req.body;

    const customer = await Customer.findById(req.params.id);

    if (customer) {
        customer.name = name || customer.name;
        customer.email = email || customer.email;
        customer.phone = phone || customer.phone;
        customer.address = address || customer.address;
        customer.city = city || customer.city;
        customer.postalCode = postalCode || customer.postalCode;
        customer.country = country || customer.country;
        customer.notes = notes !== undefined ? notes : customer.notes;

        const updatedCustomer = await customer.save();
        res.json(updatedCustomer);
    } else {
        res.status(404);
        throw new Error('Customer not found');
    }
});

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (customer) {
        // Check if customer has orders
        const orders = await Order.find({ customer: customer._id });
        if (orders.length > 0) {
            res.status(400);
            throw new Error('Cannot delete customer with existing orders');
        }

        await customer.deleteOne();
        res.json({ message: 'Customer removed' });
    } else {
        res.status(404);
        throw new Error('Customer not found');
    }
});

// @desc    Get customer orders
// @route   GET /api/customers/:id/orders
// @access  Private
const getCustomerOrders = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    const orders = await Order.find({ customer: req.params.id }).sort({ createdAt: -1 });
    res.json(orders);
});

export {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerOrders,
};