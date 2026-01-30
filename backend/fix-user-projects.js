import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserProjects() {
    try {
        // Obtener todos los usuarios
        const users = await prisma.user.findMany();
        console.log(`\n📊 Usuarios encontrados: ${users.length}`);
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email} (ID: ${user.id})`);
        });

        if (users.length === 0) {
            console.log('\n❌ No hay usuarios en la base de datos.');
            console.log('Por favor, regístrate primero en la aplicación.');
            return;
        }

        // Usar el primer usuario (o puedes elegir uno específico)
        const mainUser = users[0];
        console.log(`\n✅ Usuario principal seleccionado: ${mainUser.email}`);

        // Obtener todos los proyectos
        const allProjects = await prisma.project.findMany({
            include: {
                user: true,
            },
        });

        console.log(`\n📁 Proyectos totales: ${allProjects.length}`);

        // Contar proyectos por usuario
        const projectsByUser = {};
        allProjects.forEach(project => {
            const userId = project.userId;
            if (!projectsByUser[userId]) {
                projectsByUser[userId] = [];
            }
            projectsByUser[userId].push(project);
        });

        console.log('\n📊 Distribución de proyectos por usuario:');
        Object.entries(projectsByUser).forEach(([userId, projects]) => {
            const user = users.find(u => u.id === userId);
            console.log(`  - ${user?.email || 'Usuario eliminado'}: ${projects.length} proyectos`);
        });

        // Preguntar si quiere asignar todos los proyectos al usuario principal
        console.log(`\n🔄 Asignando todos los proyectos a: ${mainUser.email}...`);

        // Actualizar todos los proyectos para que pertenezcan al usuario principal
        const updateResult = await prisma.project.updateMany({
            where: {
                userId: {
                    not: mainUser.id,
                },
            },
            data: {
                userId: mainUser.id,
            },
        });

        console.log(`✅ ${updateResult.count} proyectos actualizados`);

        // Hacer lo mismo con repositorios, carpetas, recursos IA y lenguajes
        const reposUpdate = await prisma.repository.updateMany({
            where: { userId: { not: mainUser.id } },
            data: { userId: mainUser.id },
        });
        console.log(`✅ ${reposUpdate.count} repositorios actualizados`);

        const foldersUpdate = await prisma.folder.updateMany({
            where: { userId: { not: mainUser.id } },
            data: { userId: mainUser.id },
        });
        console.log(`✅ ${foldersUpdate.count} carpetas actualizadas`);

        const languagesUpdate = await prisma.language.updateMany({
            where: { userId: { not: mainUser.id } },
            data: { userId: mainUser.id },
        });
        console.log(`✅ ${languagesUpdate.count} lenguajes actualizados`);

        console.log('\n✨ ¡Todos los recursos ahora pertenecen a un solo usuario!');
        console.log(`\n🔑 Inicia sesión con: ${mainUser.email}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixUserProjects();
