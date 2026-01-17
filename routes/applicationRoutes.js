const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { sendJobApplicationReceipt, sendCustomEmail } = require('../utils/emailService');

// POST /api/applicationsa - Submit a new application
router.post('/', async (req, res) => {
    try {
        const { jobId, formData } = req.body;

        // Basic validation
        if (!jobId || !formData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Try to find email and name from formData case-insensitively
        let email = '';
        let name = 'Applicant';

        // Loop through keys to find email and name fields
        Object.keys(formData).forEach(key => {
            const lowerKey = key.toLowerCase();
            const value = formData[key];

            // Check if field is email type (usually 'email' or has 'email' in label)
            // Ideally the frontend sends field type, but here we scan formData keys which are field IDs usually
            // We'll rely on our FormBuilder ensuring one email field is there or checking values
            if (value && String(value).includes('@') && (lowerKey.includes('email') || !email)) {
                email = value;
            }
            if (value && (lowerKey.includes('name') || !name)) {
                name = value;
            }
        });

        // Better approach: Since we have the field definitions in Form model, we could look it up.
        // But for simplicity/speed, let's rely on common conventions or simple heuristic:
        // Client side should probably send extracted 'email' and 'name' explicitly if we want 100% reliability,
        // OR we just scan values.

        // Let's assume the client sends formData where keys are field IDs.
        // We really need the email to send the receipt. 
        // Let's rely on the frontend to identify the email field or just search for an email-like string.

        // REFINED: We will ask frontend to send 'email' and 'name' separately if possible, 
        // OR we just traverse the values.
        const values = Object.values(formData);
        const emailFound = values.find(v => String(v).match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
        if (emailFound) email = emailFound;

        // Find name (heuristic: first non-email string or specifically 'name')
        const nameFound = values.find(v => v !== email && typeof v === 'string' && v.length > 2);
        if (nameFound) name = nameFound;


        const newApplication = new Application({
            jobId,
            formData,
            email,
            name
        });

        const savedApp = await newApplication.save();

        // Fetch Job details for email
        const job = await Job.findById(jobId);
        const jobTitle = job ? job.title : 'Position';

        // Send Receipt Email
        if (email) {
            sendJobApplicationReceipt(email, name, jobTitle);
        }

        res.status(201).json(savedApp);
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/applications/:jobId - Get applications for a specific job
router.get('/:jobId', async (req, res) => {
    try {
        const applications = await Application.find({ jobId: req.params.jobId }).sort({ submittedAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/applications/:id
router.delete('/:id', async (req, res) => {
    try {
        await Application.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Application deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/applications/resend-email/:id
router.post('/resend-email/:id', async (req, res) => {
    try {
        const app = await Application.findById(req.params.id).populate('jobId');
        if (!app) return res.status(404).json({ error: 'Application not found' });

        if (app.email) {
            await sendJobApplicationReceipt(app.email, app.name, app.jobId ? app.jobId.title : 'Position');
            res.json({ success: true, message: 'Email resent' });
        } else {
            res.status(400).json({ error: 'No email address found for this application' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/applications/custom-email
router.post('/custom-email', async (req, res) => {
    try {
        const { toEmail, subject, message } = req.body;
        await sendCustomEmail(toEmail, subject, message);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
