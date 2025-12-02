import mongoose from 'mongoose';

const purchaseSchema = mongoose.Schema(
    {
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Supplier',
        },
        purchaseItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product',
                },
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                unitCost: { type: Number, required: true },
            },
        ],
        totalCost: {
            type: Number,
            required: true,
            default: 0.0,
        },
        purchaseDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Received', 'Cancelled'],
            default: 'Pending',
        },
        notes: {
            type: String,
            required: false,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        paymentMethod: {
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

const Purchase = mongoose.model('Purchase', purchaseSchema);

export default Purchase;
