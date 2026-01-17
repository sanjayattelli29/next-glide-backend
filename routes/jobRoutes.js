const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message, stack: err.stack });
    }
});

// Create a new job
router.post('/', async (req, res) => {
    const { title, department, location, type, experience, description } = req.body;
    const job = new Job({
        title,
        department,
        location,
        type,
        experience,
        description
    });

    try {
        const newJob = await job.save();
        res.status(201).json(newJob);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a job
router.put('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        Object.assign(job, req.body);
        const updatedJob = await job.save();
        res.json(updatedJob);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a job
router.delete('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        await job.deleteOne();
        res.json({ message: 'Job deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message, stack: err.stack });
    }
});

module.exports = router;
