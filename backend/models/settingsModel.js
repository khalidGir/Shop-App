import mongoose from 'mongoose';

const settingsSchema = mongoose.Schema({
  shopName: {
    type: String,
    required: true,
    default: 'My Shop',
  },
  shopLogo: {
    type: String,
    default: '/images/logo.png',
  },
  taxRate: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'ETB',
  },
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
