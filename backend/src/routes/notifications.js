import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get all notifications for current user
router.get('/', async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.userId },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notifications' });
    }
});

// Get unread count
router.get('/unread-count', async (req, res) => {
    try {
        const count = await prisma.notification.count({
            where: {
                userId: req.userId,
                read: false,
            },
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching unread count' });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await prisma.notification.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
            },
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        const updated = await prisma.notification.update({
            where: { id: req.params.id },
            data: { read: true },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Error updating notification' });
    }
});

// Mark all as read
router.put('/mark-all-read', async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                userId: req.userId,
                read: false,
            },
            data: { read: true },
        });

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating notifications' });
    }
});

// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const notification = await prisma.notification.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
            },
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        await prisma.notification.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting notification' });
    }
});

// Accept project share invitation
router.post('/:id/accept', async (req, res) => {
    try {
        const notification = await prisma.notification.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
                type: 'project_invite',
            },
        });

        if (!notification) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        const data = notification.data;
        const projectId = data?.projectId;
        const role = data?.role || 'viewer';

        if (!projectId) {
            return res.status(400).json({ error: 'Invalid invitation data' });
        }

        // Create project share
        await prisma.projectShare.create({
            data: {
                projectId,
                userId: req.userId,
                role,
            },
        });

        // Mark notification as read
        await prisma.notification.update({
            where: { id: req.params.id },
            data: { read: true },
        });

        res.json({ message: 'Invitation accepted' });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'You already have access to this project' });
        }
        res.status(500).json({ error: 'Error accepting invitation' });
    }
});

// Reject project share invitation
router.post('/:id/reject', async (req, res) => {
    try {
        const notification = await prisma.notification.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
                type: 'project_invite',
            },
        });

        if (!notification) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        // Just mark as read (or delete)
        await prisma.notification.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Invitation rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Error rejecting invitation' });
    }
});

export default router;
