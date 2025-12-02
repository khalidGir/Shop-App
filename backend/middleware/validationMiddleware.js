import { validationResult, check } from 'express-validator';

// Handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for user registration
const validateUserRegistration = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  handleValidationErrors
];

// Validation rules for user login
const validateUserLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  handleValidationErrors
];

// Validation rules for product creation
const validateProduct = [
  check('name', 'Product name is required').not().isEmpty(),
  check('price', 'Price must be a decimal number').isDecimal(),
  check('countInStock', 'Stock count must be an integer').isInt(),
  handleValidationErrors
];

// Validation rules for customer
const validateCustomer = [
  check('name', 'Customer name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  handleValidationErrors
];

// Validation rules for order
const validateOrder = [
  check('orderItems', 'Order items are required').isArray({ min: 1 }),
  check('shippingAddress', 'Shipping address is required').isObject(),
  check('paymentMethod', 'Payment method is required').not().isEmpty(),
  handleValidationErrors
];

export {
  validateUserRegistration,
  validateUserLogin,
  validateProduct,
  validateCustomer,
  validateOrder
};