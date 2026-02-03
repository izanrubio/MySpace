// ⚠️ SIEMPRE PRIMERO: carga variables de entorno
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import session from 'express-session';

// Passport
import passport from './config/passport.js';

// Rutas
import authRoutes from './routes/auth.js';
import repoRoutes from './routes/repositories.js';
import aiRoutes from './routes/aiResources.js';
import folderRoutes from './routes/folders.js';
import projectRoutes from './routes/projects.js';
import searchRoutes from './routes/search.js';
import languageRoutes from './routes/languages.js';
import notificationRoutes from './routes/notifications.js';

// ✅ Ruta de test de base de datos
import dbTestRoutes from './routes/dbTest.js';

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

// Session
app.use(
  session({
    name: 'myspace.sid',
    secret: process.env.SESSION_SECRET || 'myspace-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24h
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

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MySpace API is running' });
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

// ✅ DB TEST (MUY IMPORTANTE)
app.use('/api', dbTestRoutes);

// Solo escuchar en desarrollo local (no en Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
