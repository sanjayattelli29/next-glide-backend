require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const contactRoutes = require('./routes/contactRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const solutionRoutes = require('./routes/solutionRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Request logging middleware - VERY TOP
app.use((req, res, next) => {
    console.log(`\n🔴🔴🔴 REQUEST RECEIVED: ${req.method} ${req.originalUrl}`);
    next();
});

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
});

// Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/services', serviceRoutes); // Register Service Routes
app.use('/api/solutions', solutionRoutes); // Register Solution Routes

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
