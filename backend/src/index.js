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
import dbTestRoutes from './routes/dbTest.js';

const app = express();
const PORT = process.env.PORT || 3000;

/* -------------------- MIDDLEWARE -------------------- */

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    name: 'myspace.sid',
    secret: process.env.SESSION_SECRET || 'myspace-secret-dev',
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

/* -------------------- PASSPORT -------------------- */

app.use(passport.initialize());
app.use(passport.session());
app.set('passport', passport);

/* -------------------- ROUTES -------------------- */

app.get('/', (_, res) => {
  res.send('Welcome to MySpace API! Go to /health to check status.');
});

app.get('/health', (_, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV });
});

app.use('/api/auth', authRoutes);
app.use('/api/repositories', repoRoutes);
app.use('/api/ai-resources', aiRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/notifications', notificationRoutes);

// DB test
app.use('/api', dbTestRoutes);

/* -------------------- LISTEN (SOLO LOCAL) -------------------- */

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 MySpace API running locally on http://localhost:${PORT}`);
  });
}

export default app;
