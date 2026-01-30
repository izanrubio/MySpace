import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get all projects (own + shared)
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId: req.userId }, // Proyectos propios
          {
            sharedWith: {
              some: {
                userId: req.userId // Proyectos compartidos conmigo
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          }
        },
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
        languages: {
          include: {
            language: true,
          },
        },
        sharedWith: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
});

// Get project by ID (own or shared)
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { userId: req.userId }, // Propietario
          {
            sharedWith: {
              some: {
                userId: req.userId // Compartido conmigo
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          }
        },
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
        languages: {
          include: {
            language: true,
          },
        },
        sharedWith: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              }
            }
          }
        }
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
        OR: [
          { userId: req.userId },
          { sharedWith: { some: { userId: req.userId, role: 'editor' } } }
        ]
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or permission denied' });
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
        OR: [
          { userId: req.userId },
          { sharedWith: { some: { userId: req.userId, role: 'editor' } } }
        ]
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or permission denied' });
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
        OR: [
          { userId: req.userId },
          { sharedWith: { some: { userId: req.userId, role: 'editor' } } }
        ]
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or permission denied' });
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
        OR: [
          { userId: req.userId },
          { sharedWith: { some: { userId: req.userId, role: 'editor' } } }
        ]
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or permission denied' });
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
        OR: [
          { userId: req.userId },
          { sharedWith: { some: { userId: req.userId, role: 'editor' } } }
        ]
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or permission denied' });
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
        OR: [
          { userId: req.userId },
          { sharedWith: { some: { userId: req.userId, role: 'editor' } } }
        ]
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or permission denied' });
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
        OR: [
          { userId: req.userId },
          { sharedWith: { some: { userId: req.userId, role: 'editor' } } }
        ]
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or permission denied' });
    }

    await prisma.projectLink.delete({
      where: { id: linkId },
    });

    res.json({ message: 'Link removed from project' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing link from project' });
  }
});

// Share project with another user
router.post('/:id/share', async (req, res) => {
  try {
    const { email, role = 'viewer' } = req.body;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { userId: req.userId },
          { sharedWith: { some: { userId: req.userId, role: 'editor' } } }
        ]
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or permission denied' });
    }

    // Find user by email
    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found with that email' });
    }

    if (targetUser.id === req.userId) {
      return res.status(400).json({ error: 'Cannot share project with yourself' });
    }

    // Check if already shared
    const existingShare = await prisma.projectShare.findUnique({
      where: {
        projectId_userId: {
          projectId: req.params.id,
          userId: targetUser.id,
        },
      },
    });

    if (existingShare) {
      return res.status(400).json({ error: 'Project already shared with this user' });
    }

    // Create notification for the target user
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: 'project_invite',
        title: 'Invitación a proyecto',
        message: `${req.user?.name || 'Alguien'} te ha invitado a colaborar en el proyecto "${project.name}"`,
        projectId: project.id,
        data: {
          projectId: project.id,
          role,
          invitedBy: req.userId,
        },
      },
    });

    res.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error sharing project:', error);
    res.status(500).json({ error: 'Error sharing project' });
  }
});

// Get users with access to project
router.get('/:id/shares', async (req, res) => {
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

    const shares = await prisma.projectShare.findMany({
      where: { projectId: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(shares);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching project shares' });
  }
});

// Update user role in project
router.put('/:id/shares/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or you don\'t have permission' });
    }

    const updatedShare = await prisma.projectShare.updateMany({
      where: {
        projectId: id,
        userId,
      },
      data: {
        role,
      },
    });

    res.json({ message: 'User role updated', updatedShare });
  } catch (error) {
    res.status(500).json({ error: 'Error updating user role' });
  }
});

// Remove user access from project
router.delete('/:id/shares/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.projectShare.deleteMany({
      where: {
        projectId: id,
        userId,
      },
    });

    res.json({ message: 'User access removed' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing user access' });
  }
});

// Add language to project
router.post('/:id/languages', async (req, res) => {
  try {
    const { languageId } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { userId: req.userId },
          { sharedWith: { some: { userId: req.userId, role: 'editor' } } }
        ]
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or permission denied' });
    }

    const language = await prisma.language.findUnique({
      where: { id: languageId },
    });

    if (!language) {
      return res.status(404).json({ error: 'Language not found' });
    }

    const projectLanguage = await prisma.projectLanguage.create({
      data: {
        projectId: req.params.id,
        languageId,
      },
      include: {
        language: true,
      },
    });

    res.status(201).json(projectLanguage);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Language already added to project' });
    }
    res.status(500).json({ error: 'Error adding language to project' });
  }
});

// Remove language from project
router.delete('/:id/languages/:languageId', async (req, res) => {
  try {
    const { id, languageId } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { userId: req.userId },
          { sharedWith: { some: { userId: req.userId, role: 'editor' } } }
        ]
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or permission denied' });
    }

    await prisma.projectLanguage.deleteMany({
      where: {
        projectId: id,
        languageId,
      },
    });

    res.json({ message: 'Language removed from project' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing language from project' });
  }
});

export default router;
