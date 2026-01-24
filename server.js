require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Global Mongoose Configuration (Must be before routes/models)
mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false); // Disable buffering globally

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
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);

        // Dynamically allow ALL origins by returning true
        // This sets Access-Control-Allow-Origin to the request's Origin header
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

// Database Connection Logic (Cached for Serverless)
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    console.log('🔌 connectDB() called');
    console.log('🔍 MONGODB_URI check:', process.env.MONGODB_URI ? 'DEFINED' : 'MISSING');

    // 1. Check if we have a valid cached connection
    if (cached.conn) {
        if (cached.conn.connection.readyState === 1) {
            console.log('✅ Using existing cached MongoDB connection');
            return cached.conn;
        }
        console.log('⚠️ Cached connection exists but is not ready (state:', cached.conn.connection.readyState, '). Reconnecting...');
        cached.promise = null;
    }

    // 2. No valid cache, create new connection promise
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Disable Mongoose buffering
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        if (!process.env.MONGODB_URI) {
            console.error('❌ FATAL: MONGODB_URI is not defined in environment variables');
            throw new Error('MONGODB_URI is missing');
        }

        console.log('⏳ Connecting to MongoDB...');
        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB Connected successfully');
            return mongoose;
        }).catch(err => {
            console.error('❌ Mongoose.connect promise rejected:', err);
            throw err;
        });
    }

    // 3. Await the promise
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('❌ MongoDB Connection FATAL Error:', e);
        throw e;
    }

    return cached.conn;
};

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    // Skip DB connection for simple health check
    if (req.path === '/api/health') return next();

    // 2. Disable Mongoose Buffering (Fail fast if no connection)
    mongoose.set('bufferCommands', false);

    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('❌ Middleware DB Connection Failed:', error);
        res.status(500).json({
            error: 'Database Connection Failed',
            details: error.message,
            suggestion: 'Check MongoDB Network Access (Whitelist 0.0.0.0/0)'
        });
    }
});

// Routes
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/solutions', require('./routes/solutionRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/forms', require('./routes/formRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
// app.use('/api/social-posts', require('./routes/socialPosts'));
// app.use('/api/upload', require('./routes/upload'));
app.use('/api/chat-logs', require('./routes/chatLogs')); // Add Chat Logs Route
app.use('/webhooks/mailjet', require('./routes/webhooks'));


// Debug/Health Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            node_env: process.env.NODE_ENV,
            has_mongo_uri: !!process.env.MONGODB_URI,
            mongo_connected: mongoose.connection.readyState === 1
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
