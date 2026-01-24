const express = require('express');
const router = express.Router();

// @route   POST /webhooks/mailjet
// @desc    Handle Mailjet events (open, bounce)
router.post('/', (req, res) => {
    const events = req.body;

    // Mailjet sends an array of events
    if (Array.isArray(events)) {
        events.forEach(event => {
            if (event.event === 'bounce') {
                console.log(`⚠️ Alert: Email to ${event.email} failed!`);
            }
            if (event.event === 'open') {
                console.log(`✅ Success: ${event.email} opened the email.`);
            }
            // Log other events simply
            console.log(`📩 Mailjet Event: ${event.event} for ${event.email}`);
        });
    } else {
        console.log('📩 Mailjet Webhook received (not an array):', events);
    }

    res.status(200).send('OK');
});

module.exports = router;
