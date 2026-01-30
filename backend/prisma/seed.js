import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database cleanup...');

    console.log('🧹 Deleting all data...');

    // Limpiar en orden específico para evitar restricciones de FK
    await prisma.projectLanguage.deleteMany();
    await prisma.projectRepository.deleteMany();
    await prisma.projectAIResource.deleteMany();
    await prisma.projectLink.deleteMany();
    await prisma.project.deleteMany();
    await prisma.repository.deleteMany();
    await prisma.aIResource.deleteMany();
    await prisma.folder.deleteMany();
    await prisma.language.deleteMany();
    await prisma.user.deleteMany();

    console.log('✨ Database is now completely empty!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('  1. Register a new user in the app');
    console.log('  2. Start creating your projects, repos, and AI resources');
    console.log('');
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
