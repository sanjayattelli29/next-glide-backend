const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendWelcomeEmail, sendCustomEmail } = require('../utils/emailService');

// POST /api/contacts - Submit a new contact form
router.post('/', async (req, res) => {
    try {
        const { name, email, company, phone, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'Please provide all required fields.' });
        }

        // Save to Database
        const newContact = new Contact({
            name,
            email,
            company,
            phone,
            subject,
            message,
        });

        const savedContact = await newContact.save();

        // Send Welcome Email (Non-blocking)
        // We don't await this so the user gets a fast response, but we log errors in the service
        sendWelcomeEmail(name, email);

        res.status(201).json({
            success: true,
            message: 'Contact submitted successfully.',
            data: savedContact,
        });
    } catch (error) {
        console.error('❌ FATAL ERROR in POST /api/contacts:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message,
            stack: error.stack
        });
    }
});

// GET /api/contacts - Get all contacts (for Admin)
router.get('/', async (req, res) => {
    try {
        // Ideally, implement authentication here. 
        // Since the frontend handles the "password" gate, this endpoint is technically public if guessed.
        // For a production app, middleware to verify an admin token would be needed here.

        const contacts = await Contact.find().sort({ createdAt: -1 }); // Newest first
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /api/contacts/:id - Delete a contact
router.delete('/:id', async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/contacts/resend-welcome/:id - Resend welcome email
router.post('/resend-welcome/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        sendWelcomeEmail(contact.name, contact.email);
        res.status(200).json({ success: true, message: 'Welcome email resent successfully' });
    } catch (error) {
        console.error('Error resending welcome email:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/contacts/custom-email - Send custom email
router.post('/custom-email', async (req, res) => {
    try {
        const { toEmail, subject, message } = req.body;
        if (!toEmail || !subject || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        await sendCustomEmail(toEmail, subject, message);
        res.status(200).json({ success: true, message: 'Custom email sent successfully' });
    } catch (error) {
        console.error('Error sending custom email:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
