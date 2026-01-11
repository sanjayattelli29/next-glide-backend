const mongoose = require('mongoose');

const serviceInquirySchema = new mongoose.Schema({
    // ✅ SERVICE APPLY FORM – MINIMUM QUESTIONS (8)
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: String }, // Company / Organization Name

    // Service Selected (Auto-filled / Read-only)
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    serviceName: { type: String, required: true }, // Snapshot in case service name changes

    estimatedBudget: { type: String }, // Estimated Budget Range
    source: { type: String }, // How Did You Hear About Us?
    requirements: { type: String, required: true }, // Brief Requirement / Project Description

    // 🔹 Dynamic Form Responses
    customResponses: [{
        question: { type: String },
        answer: { type: mongoose.Schema.Types.Mixed }
    }],

    status: { type: String, enum: ['New', 'Contacted', 'In Progress', 'Closed'], default: 'New' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ServiceInquiry', serviceInquirySchema);
