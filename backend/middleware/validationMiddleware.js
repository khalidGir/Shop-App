import { validationResult, body } from 'express-validator';

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
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  handleValidationErrors
];

// Validation rules for user login
const validateUserLogin = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
  handleValidationErrors
];

// Validation rules for product creation
const validateProduct = [
  body('name', 'Product name is required').not().isEmpty(),
  body('price', 'Price must be a decimal number').isDecimal(),
  body('countInStock', 'Stock count must be an integer').isInt(),
  handleValidationErrors
];

// Validation rules for customer
const validateCustomer = [
  body('name', 'Customer name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  handleValidationErrors
];

// Validation rules for order
const validateOrder = [
  body('orderItems', 'Order items are required').isArray({ min: 1 }),
  body('shippingAddress', 'Shipping address is required').isObject(),
  body('paymentMethod', 'Payment method is required').not().isEmpty(),
  handleValidationErrors
];

export {
  validateUserRegistration,
  validateUserLogin,
  validateProduct,
  validateCustomer,
  validateOrder
};