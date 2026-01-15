const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    company: {
        type: String,
    },
    phone: {
        type: String,
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    source: {
        type: String, // e.g., 'Home', 'Careers', 'ServiceDetail'
    },
    interest: {
        type: String, // e.g., 'ServiceNow ITSM', 'Cloud Solutions'
    },
    resumeLink: {
        type: String, // URL to resume
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Contact', contactSchema);
