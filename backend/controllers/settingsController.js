import asyncHandler from 'express-async-handler';
import Settings from '../models/settingsModel.js';

// @desc    Get shop settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  // There should only be one settings document
  const settings = await Settings.findOne({});
  if (settings) {
    res.json(settings);
  } else {
    // If no settings exist, create a default one
    const defaultSettings = await Settings.create({});
    res.json(defaultSettings);
  }
});

// @desc    Update shop settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne({});

  if (settings) {
    settings.shopName = req.body.shopName || settings.shopName;
    settings.shopLogo = req.body.shopLogo || settings.shopLogo;
    settings.taxRate = req.body.taxRate || settings.taxRate;
    settings.currency = req.body.currency || settings.currency;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } else {
    const newSettings = await Settings.create(req.body);
    res.status(201).json(newSettings);
  }
});

export { getSettings, updateSettings };
