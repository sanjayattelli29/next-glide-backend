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
const allowedOrigins = [
    'https://nextglide-backend.netlify.app',
    'https://next-glide-new.netlify.app',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    'https://next-glide-backend.vercel.app',
    'https://next-glide-frontend.vercel.app'

];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
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
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI);
        isConnected = db.connections[0].readyState;
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        // Don't exit process in serverless, just throw
        throw err;
    }
};

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    await connectDB();
    next();
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
