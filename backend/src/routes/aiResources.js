import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get all AI resources
router.get('/', async (req, res) => {
  try {
    const { folderId } = req.query;

    const where = {};

    if (folderId) {
      where.folderId = folderId;
    }

    const aiResources = await prisma.aIResource.findMany({
      where,
      include: {
        folder: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(aiResources);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching AI resources' });
  }
});

// Get AI resource by ID
router.get('/:id', async (req, res) => {
  try {
    const aiResource = await prisma.aIResource.findUnique({
      where: { id: req.params.id },
      include: {
        folder: true,
        projects: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!aiResource) {
      return res.status(404).json({ error: 'AI resource not found' });
    }

    res.json(aiResource);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching AI resource' });
  }
});

// Create AI resource
router.post('/', async (req, res) => {
  try {
    const { name, url, logoUrl, type, description, tags, folderId } = req.body;

    // Validate required fields
    if (!name || !url) {
      return res.status(400).json({
        error: 'Missing required fields: name and url are required'
      });
    }

    // Default type if not provided
    const resourceType = type || 'web';

    // Validate type
    const validTypes = ['web', 'local', 'api'];
    if (!validTypes.includes(resourceType)) {
      return res.status(400).json({
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Verify folder belongs to user if folderId is provided
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: req.userId,
        },
      });

      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }
    }

    const aiResource = await prisma.aIResource.create({
      data: {
        name,
        url,
        logoUrl,
        type: resourceType,
        description,
        tags: tags || [],
        folderId,
      },
      include: {
        folder: true,
      },
    });

    res.status(201).json(aiResource);
  } catch (error) {
    console.error('Error creating AI resource:', error);
    res.status(500).json({ error: 'Error creating AI resource: ' + error.message });
  }
});

// Update AI resource
router.put('/:id', async (req, res) => {
  try {
    const { name, url, logoUrl, type, description, tags, folderId } = req.body;

    const aiResource = await prisma.aIResource.findUnique({
      where: { id: req.params.id },
    });

    if (!aiResource) {
      return res.status(404).json({ error: 'AI resource not found' });
    }

    const updated = await prisma.aIResource.update({
      where: { id: req.params.id },
      data: {
        name,
        url,
        logoUrl,
        type,
        description,
        tags,
        folderId,
      },
      include: {
        folder: true,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating AI resource' });
  }
});

// Delete AI resource
router.delete('/:id', async (req, res) => {
  try {
    const aiResource = await prisma.aIResource.findUnique({
      where: { id: req.params.id },
    });

    if (!aiResource) {
      return res.status(404).json({ error: 'AI resource not found' });
    }

    await prisma.aIResource.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'AI resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting AI resource' });
  }
});

export default router;
