import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        resource: {
            type: String, // e.g., 'Order', 'Product'
            required: true,
        },
        resourceId: {
            type: String, // ID of the resource affected
        },
        details: {
            type: mongoose.Schema.Types.Mixed, // Flexible object for extra details
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        status: {
            type: String,
            enum: ['SUCCESS', 'FAILURE'],
            default: 'SUCCESS',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for searching and filtering
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ createdAt: -1 }); // For sorting by newest

// TTL Index: Automatically delete logs after 90 days (approx 3 months)
// 90 days * 24 hours * 60 minutes * 60 seconds = 7776000 seconds
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
