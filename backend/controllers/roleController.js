import asyncHandler from 'express-async-handler';
import Role from '../models/roleModel.js';

// @desc    Create a new role
// @route   POST /api/roles
// @access  Private/SuperAdmin
const createRole = asyncHandler(async (req, res) => {
  const { name, permissions } = req.body;
  const role = new Role({ name, permissions });
  const createdRole = await role.save();
  res.status(201).json(createdRole);
});

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/SuperAdmin
const getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find({});
  res.json(roles);
});

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Private/SuperAdmin
const updateRole = asyncHandler(async (req, res) => {
  const { name, permissions } = req.body;
  const role = await Role.findById(req.params.id);
  if (role) {
    role.name = name || role.name;
    role.permissions = permissions || role.permissions;
    const updatedRole = await role.save();
    res.json(updatedRole);
  } else {
    res.status(404);
    throw new Error('Role not found');
  }
});

export { createRole, getRoles, updateRole };
