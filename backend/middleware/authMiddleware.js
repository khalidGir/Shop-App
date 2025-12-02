import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).populate('roles').select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const authorize = (...permissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      res.status(403);
      throw new Error('Not authorized, user roles not found');
    }

    const userPermissions = req.user.roles.flatMap(role => role.permissions);

    const hasPermission = permissions.some(p => userPermissions.includes(p));

    if (hasPermission) {
      next();
    } else {
      res.status(403);
      throw new Error('Not authorized to perform this action');
    }
  };
};

export { protect, authorize };