import mongoose from 'mongoose';

const customerSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        postalCode: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
            default: 'Ethiopia',
        },
        notes: {
            type: String,
            required: false,
        },
        creditLimit: {
            type: Number,
            required: true,
            default: 0,
        },
        currentBalance: {
            type: Number,
            required: true,
            default: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
