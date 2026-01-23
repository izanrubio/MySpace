import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        githubUsername: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// GitHub OAuth - Iniciar autenticación
router.get('/github', (req, res, next) => {
  console.log('🔍 GitHub OAuth initiated');
  console.log('Query params:', req.query);
  console.log('Full URL:', req.url);

  // Guardar la URL de retorno si se proporciona
  if (req.query.returnUrl) {
    console.log('Return URL:', req.query.returnUrl);
    req.session.returnUrl = req.query.returnUrl;
  }
  next();
}, (req, res, next) => {
  const passport = req.app.get('passport');
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

// GitHub OAuth - Callback
router.get('/github/callback', (req, res, next) => {
  console.log('🔍 GitHub callback received');
  console.log('Query params:', req.query);
  console.log('Full URL:', req.url);

  const passport = req.app.get('passport');
  passport.authenticate('github', { failureRedirect: '/login' }, async (err, user) => {
    if (err || !user) {
      console.error('❌ GitHub auth error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_auth_failed`);
    }

    console.log('✅ User authenticated:', user.email);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Redirect to frontend with token
    const returnUrl = req.session?.returnUrl || process.env.FRONTEND_URL;
    delete req.session?.returnUrl;

    console.log('🔄 Redirecting to:', `${process.env.FRONTEND_URL}/auth/callback?token=${token.substring(0, 20)}...`);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  })(req, res, next);
});

export default router;

