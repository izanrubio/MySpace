#!/bin/bash

echo "🚀 Configurando MySpace - MVP"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Node.js no está instalado. Por favor instala Node.js >= 18"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null
then
    echo "⚠️  PostgreSQL no detectado. Asegúrate de tenerlo instalado y corriendo"
fi

echo ""
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

echo ""
echo "📦 Instalando dependencias del frontend..."
cd ../frontend
npm install

echo ""
echo "✅ Instalación completada!"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Configura PostgreSQL y crea la base de datos:"
echo "   createdb myspace_db"
echo ""
echo "2. Configura el archivo .env en backend/:"
echo "   cd backend"
echo "   cp .env.example .env"
echo "   # Edita .env con tus credenciales"
echo ""
echo "3. Ejecuta las migraciones de Prisma:"
echo "   cd backend"
echo "   npx prisma generate"
echo "   npx prisma migrate dev --name init"
echo ""
echo "4. Inicia el backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "5. En otra terminal, inicia el frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "🎉 Luego abre http://localhost:5173 en tu navegador"
