import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
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
        links: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        repos: {
          include: {
            repository: true,
          },
        },
        aiResources: {
          include: {
            aiResource: {
              include: {
                folder: true,
              },
            },
          },
        },
        links: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching project' });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    const { name, description, notes } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        notes,
        userId: req.userId,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error creating project' });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, description, notes } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        notes,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating project' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.project.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting project' });
  }
});

// Add repository to project
router.post('/:id/repositories', async (req, res) => {
  try {
    const { repoId } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const repo = await prisma.repository.findFirst({
      where: {
        id: repoId,
        userId: req.userId,
      },
    });

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const projectRepo = await prisma.projectRepository.create({
      data: {
        projectId: req.params.id,
        repoId,
      },
      include: {
        repository: true,
      },
    });

    res.status(201).json(projectRepo);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Repository already added to project' });
    }
    res.status(500).json({ error: 'Error adding repository to project' });
  }
});

// Remove repository from project
router.delete('/:id/repositories/:repoId', async (req, res) => {
  try {
    const { id, repoId } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.projectRepository.deleteMany({
      where: {
        projectId: id,
        repoId,
      },
    });

    res.json({ message: 'Repository removed from project' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing repository from project' });
  }
});

// Add AI resource to project
router.post('/:id/ai-resources', async (req, res) => {
  try {
    const { aiResourceId } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const aiResource = await prisma.aIResource.findUnique({
      where: { id: aiResourceId },
    });

    if (!aiResource) {
      return res.status(404).json({ error: 'AI resource not found' });
    }

    const projectAI = await prisma.projectAIResource.create({
      data: {
        projectId: req.params.id,
        aiResourceId,
      },
      include: {
        aiResource: true,
      },
    });

    res.status(201).json(projectAI);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'AI resource already added to project' });
    }
    res.status(500).json({ error: 'Error adding AI resource to project' });
  }
});

// Remove AI resource from project
router.delete('/:id/ai-resources/:aiResourceId', async (req, res) => {
  try {
    const { id, aiResourceId } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.projectAIResource.deleteMany({
      where: {
        projectId: id,
        aiResourceId,
      },
    });

    res.json({ message: 'AI resource removed from project' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing AI resource from project' });
  }
});

// Add link to project
router.post('/:id/links', async (req, res) => {
  try {
    const { title, url } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const link = await prisma.projectLink.create({
      data: {
        projectId: req.params.id,
        title,
        url,
      },
    });

    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ error: 'Error adding link to project' });
  }
});

// Delete link from project
router.delete('/:id/links/:linkId', async (req, res) => {
  try {
    const { id, linkId } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.projectLink.delete({
      where: { id: linkId },
    });

    res.json({ message: 'Link removed from project' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing link from project' });
  }
});

export default router;
