import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/languages - Obtener todos los lenguajes del usuario
router.get('/', authMiddleware, async (req, res) => {
    try {
        const languages = await prisma.language.findMany({
            where: { userId: req.userId },
            include: {
                projects: {
                    include: {
                        project: {
                            select: { id: true, name: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Transformar la respuesta para simplificar la estructura de proyectos
        const transformedLanguages = languages.map(lang => ({
            ...lang,
            projects: lang.projects.map(p => p.project)
        }));

        res.json(transformedLanguages);
    } catch (error) {
        console.error('Error al obtener lenguajes:', error);
        res.status(500).json({ error: 'Error al obtener lenguajes' });
    }
});

// GET /api/languages/:id - Obtener un lenguaje específico
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const language = await prisma.language.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
            },
            include: {
                projects: {
                    include: {
                        project: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });

        if (!language) {
            return res.status(404).json({ error: 'Lenguaje no encontrado' });
        }

        // Transformar respuesta
        const transformedLanguage = {
            ...language,
            projects: language.projects.map(p => p.project)
        };

        res.json(transformedLanguage);
    } catch (error) {
        console.error('Error al obtener lenguaje:', error);
        res.status(500).json({ error: 'Error al obtener lenguaje' });
    }
});

// POST /api/languages - Crear un nuevo lenguaje
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, category, image, projectIds } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'El nombre del lenguaje es requerido' });
        }

        const language = await prisma.language.create({
            data: {
                name,
                category,
                image,
                userId: req.userId,
                // Si se envían projectIds, crear las relaciones
                projects: projectIds && projectIds.length > 0 ? {
                    create: projectIds.map(id => ({ projectId: id }))
                } : undefined
            },
            include: {
                projects: {
                    include: {
                        project: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });

        const transformedLanguage = {
            ...language,
            projects: language.projects.map(p => p.project)
        };

        res.status(201).json(transformedLanguage);
    } catch (error) {
        console.error('Error al crear lenguaje:', error);
        res.status(500).json({ error: 'Error al crear lenguaje' });
    }
});

// PUT /api/languages/:id - Actualizar un lenguaje y sus proyectos
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, category, image, projectIds } = req.body;

        // Verificar que el lenguaje pertenece al usuario
        const existing = await prisma.language.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Lenguaje no encontrado' });
        }

        // Preparar la actualización de relaciones si se envían projectIds
        let projectsUpdate = {};
        if (projectIds) {
            projectsUpdate = {
                projects: {
                    deleteMany: {}, // Borrar relaciones existentes
                    create: projectIds.map(id => ({ projectId: id })) // Crear las nuevas
                }
            };
        }

        const language = await prisma.language.update({
            where: { id: req.params.id },
            data: {
                name,
                category,
                image,
                ...projectsUpdate
            },
            include: {
                projects: {
                    include: {
                        project: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });

        const transformedLanguage = {
            ...language,
            projects: language.projects.map(p => p.project)
        };

        res.json(transformedLanguage);
    } catch (error) {
        console.error('Error al actualizar lenguaje:', error);
        res.status(500).json({ error: 'Error al actualizar lenguaje' });
    }
});

// DELETE /api/languages/:id - Eliminar un lenguaje
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const existing = await prisma.language.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Lenguaje no encontrado' });
        }

        await prisma.language.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Lenguaje eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar lenguaje:', error);
        res.status(500).json({ error: 'Error al eliminar lenguaje' });
    }
});

export default router;
