import mongoose from 'mongoose';

const stockMovementSchema = mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
        type: {
            type: String,
            required: true,
            enum: ['Purchase', 'Sale', 'Adjustment', 'Return'],
        },
        quantity: {
            type: Number,
            required: true,
        },
        previousStock: {
            type: Number,
            required: true,
        },
        newStock: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: false,
        },
        reference: {
            type: String,
            required: false,
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

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

export default StockMovement;
