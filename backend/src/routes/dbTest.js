import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

router.get('/db-test', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json({ ok: true, users });
    } catch (error) {
        console.error('DB TEST ERROR:', error);
        res.status(500).json({
            ok: false,
            error: error.message,
        });
    }
});

export default router;
