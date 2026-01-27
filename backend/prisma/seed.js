import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    console.log('🧹 Cleaning database...');

    // Limpiar en orden específico para evitar restricciones de FK
    await prisma.projectRepository.deleteMany();
    await prisma.projectAIResource.deleteMany();
    await prisma.projectLink.deleteMany();
    await prisma.project.deleteMany();
    await prisma.repository.deleteMany();
    await prisma.aIResource.deleteMany();
    await prisma.folder.deleteMany();
    await prisma.user.deleteMany();

    console.log('✨ Database cleaned fully');

    // 2. Crear usuario Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'admin@myspace.com' },
        update: {},
        create: {
            email: 'admin@myspace.com',
            name: 'Admin User',
            password: hashedPassword,
            avatarUrl: 'https://github.com/shadcn.png',
        },
    });

    console.log(`👤 Created user: ${user.name}`);

    // 3. Crear Carpetas
    const devFolder = await prisma.folder.create({
        data: {
            name: 'Development',
            description: 'Herramientas de desarrollo',
            userId: user.id,
        },
    });

    const designFolder = await prisma.folder.create({
        data: {
            name: 'Design',
            description: 'Recursos de diseño UI/UX',
            userId: user.id,
        },
    });

    console.log('📁 Created folders');

    // 4. Crear Recursos de IA
    await prisma.aIResource.create({
        data: {
            name: 'ChatGPT',
            url: 'https://chat.openai.com',
            type: 'web',
            description: 'Asistente de IA general',
            tags: ['llm', 'chat', 'general'],
            folderId: devFolder.id,
        },
    });

    await prisma.aIResource.create({
        data: {
            name: 'Midjourney',
            url: 'https://discord.com/invite/midjourney',
            type: 'web',
            description: 'Generación de imágenes',
            tags: ['image', 'art', 'generative'],
            folderId: designFolder.id,
        },
    });

    console.log('🤖 Created AI resources');

    // 5. Crear Repositorio
    const repo = await prisma.repository.create({
        data: {
            name: 'myspace-app',
            url: 'https://github.com/admin/myspace',
            description: 'Aplicación personal de gestión',
            technology: 'React + Node',
            tags: ['fullstack', 'personal'],
            status: 'programando',
            userId: user.id,
        },
    });

    console.log('💻 Created repository');

    // 6. Crear Proyecto
    await prisma.project.create({
        data: {
            name: 'MySpace Redesign',
            description: 'Rediseño completo de la interfaz',
            notes: '# Plan de trabajo\n- [ ] Header\n- [ ] Sidebar\n- [ ] Dashboard',
            userId: user.id,
            repos: {
                create: {
                    repoId: repo.id
                }
            }
        },
    });

    console.log('🚀 Created project');
    console.log('✅ Seed finished successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
