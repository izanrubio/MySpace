import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function generateTestToken() {
    try {
        // Obtener el usuario admin
        const user = await prisma.user.findUnique({
            where: { email: 'admin@myspace.com' },
        });

        if (!user) {
            console.log('❌ Usuario admin@myspace.com no encontrado');
            console.log('\n📝 Usuarios disponibles:');
            const allUsers = await prisma.user.findMany({
                select: { email: true, id: true, name: true },
            });
            allUsers.forEach(u => {
                console.log(`  - ${u.email} (${u.name})`);
            });
            return;
        }

        // Generar token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('\n✅ Token generado para:', user.email);
        console.log('\n🔑 Token JWT:');
        console.log(token);
        console.log('\n📋 Copia este token y úsalo en el frontend:');
        console.log('\n1. Abre la consola del navegador (F12)');
        console.log('2. Ejecuta: localStorage.setItem("token", "' + token + '")');
        console.log('3. Recarga la página');
        console.log('\n✨ ¡Deberías ver todos tus proyectos!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

generateTestToken();
