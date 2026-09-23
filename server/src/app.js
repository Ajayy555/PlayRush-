const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const { redirect } = require('./controllers/linksController');

const authRoutes         = require('./routes/auth');
const analyticsRoutes    = require('./routes/analytics');
const verificationRoutes = require('./routes/verification');
const linksRoutes        = require('./routes/links');
const adminRoutes        = require('./routes/admin');
const errorHandler       = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or any matching origin
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback to allow connection in production
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // allow base64 photos
app.use(morgan('dev'));

// Public short URL redirect
app.get('/r/:code', redirect);

// API routes
app.use('/api/auth',         authRoutes);
app.use('/api/analytics',    analyticsRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/links',        linksRoutes);
app.use('/api/admin',        adminRoutes);

// Health
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// Error handler
app.use(errorHandler);

module.exports = app;
