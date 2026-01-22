import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all repositories
router.get('/', async (req, res) => {
  try {
    const repos = await prisma.repository.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching repositories' });
  }
});

// Get repository by ID
router.get('/:id', async (req, res) => {
  try {
    const repo = await prisma.repository.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    res.json(repo);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching repository' });
  }
});

// Create repository
router.post('/', async (req, res) => {
  try {
    const { name, url, deployUrl, description, technology, tags, status } = req.body;

    const repo = await prisma.repository.create({
      data: {
        name,
        url,
        deployUrl,
        description,
        technology,
        tags: tags || [],
        status: status || 'activo',
        userId: req.userId,
      },
    });

    res.status(201).json(repo);
  } catch (error) {
    res.status(500).json({ error: 'Error creating repository' });
  }
});

// Update repository
router.put('/:id', async (req, res) => {
  try {
    const { name, url, deployUrl, description, technology, tags, status } = req.body;

    const repo = await prisma.repository.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const updated = await prisma.repository.update({
      where: { id: req.params.id },
      data: {
        name,
        url,
        deployUrl,
        description,
        technology,
        tags,
        status,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating repository' });
  }
});

// Delete repository
router.delete('/:id', async (req, res) => {
  try {
    const repo = await prisma.repository.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    await prisma.repository.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Repository deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting repository' });
  }
});

export default router;
