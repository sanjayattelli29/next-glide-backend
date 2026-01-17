const express = require('express');
const router = express.Router();
const Form = require('../models/Form');

// Get form by Job ID
router.get('/:jobId', async (req, res) => {
    try {
        const form = await Form.findOne({ jobId: req.params.jobId });
        if (!form) return res.json({ fields: [] }); // Return empty fields if no form exists yet
        res.json(form);
    } catch (err) {
        res.status(500).json({ message: err.message, stack: err.stack });
    }
});

// Save or Update form for a Job
router.post('/', async (req, res) => {
    const { jobId, fields } = req.body;

    try {
        let form = await Form.findOne({ jobId });
        if (form) {
            form.fields = fields;
            await form.save();
        } else {
            form = new Form({ jobId, fields });
            await form.save();
        }
        res.status(201).json(form);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
