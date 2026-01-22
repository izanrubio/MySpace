import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get all folders (with hierarchy)
router.get('/', async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.userId },
      include: {
        children: true,
        aiResources: true,
        parent: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching folders' });
  }
});

// Get folder by ID
router.get('/:id', async (req, res) => {
  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        children: true,
        aiResources: true,
        parent: true,
      },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching folder' });
  }
});

// Create folder
router.post('/', async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    // Normalize parentId: convert empty string to null
    const normalizedParentId = parentId && parentId.trim() !== '' ? parentId : null;

    // Verify parent folder belongs to user if parentId is provided
    if (normalizedParentId) {
      const parent = await prisma.folder.findFirst({
        where: {
          id: normalizedParentId,
          userId: req.userId,
        },
      });

      if (!parent) {
        return res.status(404).json({ error: 'Parent folder not found' });
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        description,
        parentId: normalizedParentId,
        userId: req.userId,
      },
      include: {
        children: true,
        aiResources: true,
      },
    });

    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Error creating folder' });
  }
});

// Update folder
router.put('/:id', async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    const folder = await prisma.folder.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Normalize parentId: convert empty string to null
    const normalizedParentId = parentId && parentId.trim() !== '' ? parentId : null;

    const updated = await prisma.folder.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        parentId: normalizedParentId,
      },
      include: {
        children: true,
        aiResources: true,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating folder' });
  }
});

// Delete folder
router.delete('/:id', async (req, res) => {
  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    await prisma.folder.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting folder' });
  }
});

export default router;
