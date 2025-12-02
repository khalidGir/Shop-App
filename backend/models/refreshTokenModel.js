import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        expires: {
            type: Date,
            required: true,
        },
        createdByIp: {
            type: String,
            required: true,
        },
        revoked: {
            type: Date,
        },
        revokedByIp: {
            type: String,
        },
        replacedByToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual property to check if token is expired
refreshTokenSchema.virtual('isExpired').get(function () {
    return Date.now() >= this.expires;
});

// Virtual property to check if token is active
refreshTokenSchema.virtual('isActive').get(function () {
    return !this.revoked && !this.isExpired;
});

// Index for faster lookups
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ user: 1 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
