import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Customer',
        },
        invoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Invoice',
        },
        amount: {
            type: Number,
            required: true,
        },
        paymentDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['Cash', 'Bank Transfer', 'Check', 'Mobile Money', 'Other'],
        },
        reference: {
            type: String,
        },
        notes: {
            type: String,
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

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
