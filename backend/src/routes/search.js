import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Global search
router.get('/', async (req, res) => {
  try {
    const { q, tags } = req.query;

    if (!q && !tags) {
      return res.status(400).json({ error: 'Search query or tags required' });
    }

    const results = {
      repositories: [],
      aiResources: [],
      projects: [],
      folders: [],
    };

    // Build search conditions
    const searchCondition = q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    } : {};

    const tagCondition = tags ? {
      tags: {
        hasSome: tags.split(','),
      },
    } : {};

    // Search repositories
    results.repositories = await prisma.repository.findMany({
      where: {
        userId: req.userId,
        AND: [searchCondition, tagCondition],
      },
      take: 10,
    });

    // Search AI resources
    results.aiResources = await prisma.aIResource.findMany({
      where: {
        AND: [searchCondition, tagCondition],
      },
      include: {
        folder: true,
      },
      take: 10,
    });

    // Search projects
    if (q) {
      results.projects = await prisma.project.findMany({
        where: {
          userId: req.userId,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { notes: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: {
          repos: {
            include: {
              repository: true,
            },
          },
          aiResources: {
            include: {
              aiResource: true,
            },
          },
        },
        take: 10,
      });

      // Search folders
      results.folders = await prisma.folder.findMany({
        where: {
          userId: req.userId,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: {
          aiResources: true,
        },
        take: 10,
      });
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error performing search' });
  }
});

// Get all unique tags
router.get('/tags', async (req, res) => {
  try {
    const repos = await prisma.repository.findMany({
      where: { userId: req.userId },
      select: { tags: true },
    });

    const aiResources = await prisma.aIResource.findMany({
      select: { tags: true },
    });

    const allTags = new Set();
    
    repos.forEach(repo => {
      repo.tags.forEach(tag => allTags.add(tag));
    });

    aiResources.forEach(ai => {
      ai.tags.forEach(tag => allTags.add(tag));
    });

    res.json(Array.from(allTags).sort());
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tags' });
  }
});

export default router;
