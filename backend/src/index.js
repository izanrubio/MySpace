import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import repoRoutes from './routes/repositories.js';
import aiRoutes from './routes/aiResources.js';
import folderRoutes from './routes/folders.js';
import projectRoutes from './routes/projects.js';
import searchRoutes from './routes/search.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/repositories', repoRoutes);
app.use('/api/ai-resources', aiRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MySpace API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
