const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const ServiceInquiry = require('../models/ServiceInquiry');
const { sendWelcomeEmail, sendCustomEmail, sendApplicationReceiptEmail } = require('../utils/emailService');

// --- SERVICE ROUTES ---

// GET /api/services - List all services (Listing fields only)
router.get('/', async (req, res) => {
    try {
        // Select only fields needed for the listing page
        const services = await Service.find().select('name shortDescription category startingPrice ctaText slug');
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message, stack: error.stack });
    }
});

// GET /api/services/:slug - Get full details of a specific service
router.get('/:slug', async (req, res) => {
    try {
        const service = await Service.findOne({ slug: req.params.slug });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.status(200).json(service);
    } catch (error) {
        console.error('Error fetching service details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/services - Create new service (Admin)
router.post('/', async (req, res) => {
    try {
        // Basic validation for existing slug
        const existingService = await Service.findOne({ slug: req.body.slug });
        if (existingService) {
            return res.status(400).json({ error: 'Service with this URL (slug) already exists.' });
        }

        const newService = new Service(req.body);
        const savedService = await newService.save();
        res.status(201).json(savedService);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// PUT /api/services/:id - Update service (Admin)
router.put('/:id', async (req, res) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedService) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.status(200).json(updatedService);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /api/services/:id - Delete service (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- INQUIRY ROUTES ---

// POST /api/services/inquiry - Submit an inquiry
router.post('/inquiry', async (req, res) => {
    try {
        const { fullName, email, serviceName, customResponses } = req.body;

        const newInquiry = new ServiceInquiry({
            ...req.body,
            customResponses: customResponses || []
        });
        await newInquiry.save();

        // 1. Send Confirmation Email to User
        // Send Confirmation Email using Colorful HTML Template
        sendApplicationReceiptEmail(newInquiry);

        res.status(201).json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting inquiry:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// GET /api/services/inquiries - Get all inquiries (Admin)
router.get('/inquiries/all', async (req, res) => {
    try {
        const inquiries = await ServiceInquiry.find().sort({ createdAt: -1 });
        res.status(200).json(inquiries);
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /api/services/inquiries/:id - Delete inquiry
router.delete('/inquiries/:id', async (req, res) => {
    try {
        await ServiceInquiry.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Inquiry deleted successfully' });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/services/inquiries/:id/resend - Resend Receipt Email
router.post('/inquiries/:id/resend', async (req, res) => {
    try {
        const inquiry = await ServiceInquiry.findById(req.params.id);
        if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });

        const sent = await sendApplicationReceiptEmail(inquiry);
        if (sent) {
            res.status(200).json({ success: true, message: 'Email resent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send email' });
        }
    } catch (error) {
        console.error('Error resending email:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
