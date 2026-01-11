const express = require('express');
const router = express.Router();
const Solution = require('../models/Solution');
const SolutionInquiry = require('../models/SolutionInquiry');
const { sendWelcomeEmail, sendCustomEmail, sendApplicationReceiptEmail } = require('../utils/emailService');

// --- SOLUTION ROUTES ---

// GET /api/solutions - List all solutions (Listing fields only)
router.get('/', async (req, res) => {
    try {
        // Select only fields needed for the listing page
        const solutions = await Solution.find().select('name shortDescription category startingPrice ctaText slug');
        res.status(200).json(solutions);
    } catch (error) {
        console.error('Error fetching solutions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/solutions/:slug - Get full details of a specific solution
router.get('/:slug', async (req, res) => {
    try {
        const solution = await Solution.findOne({ slug: req.params.slug });
        if (!solution) {
            return res.status(404).json({ error: 'Solution not found' });
        }
        res.status(200).json(solution);
    } catch (error) {
        console.error('Error fetching solution details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/solutions - Create new solution (Admin)
router.post('/', async (req, res) => {
    try {
        // Basic validation for existing slug
        const existingSolution = await Solution.findOne({ slug: req.body.slug });
        if (existingSolution) {
            return res.status(400).json({ error: 'Solution with this URL (slug) already exists.' });
        }

        const newSolution = new Solution(req.body);
        const savedSolution = await newSolution.save();
        res.status(201).json(savedSolution);
    } catch (error) {
        console.error('Error creating solution:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// PUT /api/solutions/:id - Update solution (Admin)
router.put('/:id', async (req, res) => {
    try {
        const updatedSolution = await Solution.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSolution) {
            return res.status(404).json({ error: 'Solution not found' });
        }
        res.status(200).json(updatedSolution);
    } catch (error) {
        console.error('Error updating solution:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /api/solutions/:id - Delete solution (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await Solution.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Solution deleted successfully' });
    } catch (error) {
        console.error('Error deleting solution:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- INQUIRY ROUTES ---

// POST /api/solutions/inquiry - Submit an inquiry
router.post('/inquiry', async (req, res) => {
    try {
        const { fullName, email, solutionName, customResponses } = req.body;

        const newInquiry = new SolutionInquiry({
            ...req.body,
            customResponses: customResponses || []
        });
        await newInquiry.save();

        // 1. Send Confirmation Email to User (Reusing existing function, might need slight tweak if email content refers to "Service", but usually it's generic enough or we pass context)
        // Check `utils/emailService.js` if possible, but for now assuming it works for any inquiry object
        // Actually, let's just use it. If it says "Service Application", it might need updating later.
        if (sendApplicationReceiptEmail) {
            // We might want to pass a flag or updated object to indicate it's a Solution?
            // For now, let's treat it same as service inquiry.
            sendApplicationReceiptEmail(newInquiry);
        }

        res.status(201).json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting inquiry:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// GET /api/solutions/inquiries/all - Get all inquiries (Admin)
router.get('/inquiries/all', async (req, res) => {
    try {
        const inquiries = await SolutionInquiry.find().sort({ createdAt: -1 });
        res.status(200).json(inquiries);
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /api/solutions/inquiries/:id - Delete inquiry
router.delete('/inquiries/:id', async (req, res) => {
    try {
        await SolutionInquiry.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Inquiry deleted successfully' });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/solutions/inquiries/:id/resend - Resend Receipt Email
router.post('/inquiries/:id/resend', async (req, res) => {
    try {
        const inquiry = await SolutionInquiry.findById(req.params.id);
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
