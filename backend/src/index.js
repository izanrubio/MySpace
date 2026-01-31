// ⚠️ SIEMPRE PRIMERO: carga variables de entorno antes de cualquier import
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import session from 'express-session';

// Imports internos (después de dotenv)
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import repoRoutes from './routes/repositories.js';
import aiRoutes from './routes/aiResources.js';
import folderRoutes from './routes/folders.js';
import projectRoutes from './routes/projects.js';
import searchRoutes from './routes/search.js';
import languageRoutes from './routes/languages.js';
import notificationRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'myspace-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());
app.set('passport', passport);

// Root
app.get('/', (req, res) => {
  res.send('Welcome to MySpace API! Go to /health to check status.');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/repositories', repoRoutes);
app.use('/api/ai-resources', aiRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MySpace API is running' });
});

// ❗ En Vercel NO se hace listen
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

export default app;
