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
    const { name, url, deployUrl, description, technology, tags, status, isPrivate } = req.body;

    const repo = await prisma.repository.create({
      data: {
        name,
        url,
        deployUrl,
        description,
        technology,
        tags: tags || [],
        status: status || 'activo',
        isPrivate: isPrivate || false,
        userId: req.userId,
      },
    });

    res.status(201).json(repo);
  } catch (error) {
    res.status(500).json({ error: 'Error creating repository' });
  }
});

// Create GitHub repository
router.post('/github', async (req, res) => {
  try {
    const { name, description, isPrivate, autoInit } = req.body;

    // Get user with GitHub access token
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { githubAccessToken: true, githubUsername: true },
    });

    if (!user?.githubAccessToken) {
      return res.status(400).json({
        error: 'GitHub account not connected. Please login with GitHub first.'
      });
    }

    // Import Octokit dynamically
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: user.githubAccessToken });

    // Create repository on GitHub
    const { data: githubRepo } = await octokit.repos.createForAuthenticatedUser({
      name,
      description: description || '',
      private: isPrivate !== false, // Default to private
      auto_init: autoInit !== false, // Default to true (creates README)
    });

    // Save repository to database
    const repo = await prisma.repository.create({
      data: {
        name: githubRepo.name,
        url: githubRepo.html_url,
        description: githubRepo.description || '',
        technology: '',
        tags: [],
        status: 'programando',
        isPrivate: githubRepo.private,
        userId: req.userId,
      },
    });

    // Return repository info with clone URLs
    res.status(201).json({
      ...repo,
      cloneUrls: {
        https: githubRepo.clone_url,
        ssh: githubRepo.ssh_url,
      },
      githubUrl: githubRepo.html_url,
    });
  } catch (error) {
    console.error('Error creating GitHub repository:', error);

    if (error.status === 401) {
      return res.status(401).json({
        error: 'GitHub authentication failed. Please reconnect your GitHub account.'
      });
    }

    if (error.status === 422) {
      return res.status(422).json({
        error: 'Repository name already exists or is invalid.'
      });
    }

    res.status(500).json({
      error: error.message || 'Error creating GitHub repository'
    });
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
