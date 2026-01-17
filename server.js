require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const contactRoutes = require('./routes/contactRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const solutionRoutes = require('./routes/solutionRoutes');
const jobRoutes = require('./routes/jobRoutes');
const formRoutes = require('./routes/formRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Request logging middleware - VERY TOP
app.use((req, res, next) => {
    console.log(`\n🔴🔴🔴 REQUEST RECEIVED: ${req.method} ${req.originalUrl}`);
    next();
});

// CORS Configuration
app.use(cors({
    origin: '*', // Allow ALL origins
    credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
    console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
});

// Status Route
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NextGlide Backend Status</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5; color: #333; }
            .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #0070f3; margin-bottom: 0.5rem; }
            p { color: #666; }
            .status { display: inline-block; padding: 0.25rem 0.5rem; background: #e6fffa; color: #047857; border-radius: 4px; font-weight: bold; margin-top: 1rem; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Backend Running</h1>
            <p>NextGlide Elevate Backend is active and listening.</p>
            <div class="status">● System Operational</div>
        </div>
    </body>
    </html>
    `);
});

// Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/services', serviceRoutes); // Register Service Routes
app.use('/api/solutions', solutionRoutes); // Register Solution Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/applications', require('./routes/applicationRoutes'));


// Database Connection Logic
// Database Connection Logic
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('✅ Using existing MongoDB connection');
        return;
    }

    // DEBUG: Check if URI exists (don't log the full secret)
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is MISSING in environment variables!');
        throw new Error('MONGODB_URI is missing');
    } else {
        console.log('ℹ️ MONGODB_URI is present (starts with: ' + process.env.MONGODB_URI.substring(0, 15) + '...)');
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
        });
        isConnected = db.connections[0].readyState;
        console.log('✅ MongoDB Connected successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection FATAL Error:', err);
        throw err;
    }
};

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    // Skip DB connection for simple health check
    if (req.path === '/api/health') return next();

    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('❌ Middleware DB Connection Failed:', error);
        res.status(500).json({ error: 'Database Connection Failed', details: error.message });
    }
});

// Debug/Health Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            node_env: process.env.NODE_ENV,
            has_mongo_uri: !!process.env.MONGODB_URI,
            mongo_connected: isConnected
        }
    });
});

// Start Server locally
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    });
}

// Export the app directly for Vercel
module.exports = app;
