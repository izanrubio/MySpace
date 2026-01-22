# 🚀 MySpace - Gestión Personal de Repos, IAs y Proyectos

**MVP completo** de una aplicación web privada para organizar repositorios Git, recursos de IA y proyectos personales. Incluye dashboard moderno, búsqueda global, sistema de carpetas jerárquico y autenticación JWT.

## 📋 Características

### ✨ Funcionalidades Principales

- **Repositorios**: Lista plana con CRUD completo, tags, tecnología y estados
- **Recursos IA**: Organización jerárquica por carpetas, tipos (web/local/API), tags
- **Proyectos**: Agrupación de repos y recursos IA, notas en Markdown, enlaces adicionales
- **Búsqueda Global**: Buscar en todos los recursos por nombre, descripción o tags
- **Autenticación**: Sistema privado con JWT para un solo usuario

### 🛠️ Stack Tecnológico

**Backend**
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT para autenticación
- bcryptjs para encriptación

**Frontend**
- React 18
- Vite
- Tailwind CSS
- React Router v6
- Axios
- React Markdown

## 📁 Estructura del Proyecto

```
MySpace/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Modelo de base de datos
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js        # Configuración Prisma
│   │   ├── middleware/
│   │   │   └── auth.js            # Middleware JWT
│   │   ├── routes/
│   │   │   ├── auth.js            # Login/Register
│   │   │   ├── repositories.js    # CRUD Repos
│   │   │   ├── folders.js         # CRUD Carpetas
│   │   │   ├── aiResources.js     # CRUD IAs
│   │   │   ├── projects.js        # CRUD Proyectos
│   │   │   └── search.js          # Búsqueda global
│   │   └── index.js               # Servidor Express
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx        # Navegación lateral
    │   │   ├── Header.jsx         # Barra búsqueda
    │   │   └── Modal.jsx          # Modal reutilizable
    │   ├── context/
    │   │   └── AuthContext.jsx    # Estado autenticación
    │   ├── pages/
    │   │   ├── Login.jsx          # Login/Register
    │   │   ├── Dashboard.jsx      # Layout principal
    │   │   ├── Repositories.jsx   # Vista repos
    │   │   ├── AIResources.jsx    # Vista IAs con carpetas
    │   │   └── Projects.jsx       # Vista proyectos
    │   ├── services/
    │   │   └── api.js             # Cliente API
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## 🗄️ Modelo de Base de Datos

### Tablas Principales

- **User**: Usuarios del sistema
- **Repository**: Repositorios Git con tags, tecnología y estado
- **Folder**: Carpetas jerárquicas para organizar IAs
- **AIResource**: Recursos de IA con tipos y tags
- **Project**: Proyectos que agrupan repos y recursos
- **ProjectRepository**: Relación muchos-a-muchos Proyecto ↔ Repositorio
- **ProjectAIResource**: Relación muchos-a-muchos Proyecto ↔ Recurso IA
- **ProjectLink**: Enlaces adicionales en proyectos

Ver detalles completos en [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm o yarn

### 1. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
# DATABASE_URL="postgresql://usuario:password@localhost:5432/myspace_db"
# JWT_SECRET="tu_clave_secreta_super_segura"
```

### 2. Inicializar Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Crear y aplicar migraciones
npx prisma migrate dev --name init

# (Opcional) Abrir Prisma Studio para ver datos
npx prisma studio
```

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install
```

### 4. Ejecutar en Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Servidor corriendo en http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App corriendo en http://localhost:5173
```

## 📖 Ejemplo de Flujo de Uso

### 1. Registro e Inicio de Sesión

1. Abre `http://localhost:5173`
2. Regístrate con email, contraseña y nombre
3. Automáticamente inicias sesión

### 2. Añadir un Repositorio

1. Navega a **Repositorios** en el sidebar
2. Clic en **Nuevo Repositorio**
3. Completa: nombre, URL, descripción, tecnología, tags
4. Guarda y aparecerá en la lista

### 3. Crear Carpetas y Recursos IA

1. Navega a **IAs**
2. Crea una carpeta (ej: "LLMs")
3. Añade un recurso IA dentro de la carpeta:
   - Nombre: "ChatGPT"
   - URL: "https://chat.openai.com"
   - Tipo: "web"
   - Tags: "chatbot, nlp"

### 4. Crear un Proyecto y Enlazar Recursos

1. Navega a **Proyectos**
2. Crea nuevo proyecto con nombre y descripción
3. Expande el proyecto (clic en flecha)
4. Añade repositorios desde el dropdown
5. Añade recursos IA
6. Añade enlaces externos
7. Escribe notas en Markdown

### 5. Búsqueda Global

Desde cualquier vista, usa el buscador del header para encontrar recursos por nombre, descripción o contenido.

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Repositorios
- `GET /api/repositories` - Listar todos
- `POST /api/repositories` - Crear
- `PUT /api/repositories/:id` - Actualizar
- `DELETE /api/repositories/:id` - Eliminar

### Carpetas
- `GET /api/folders` - Listar todas (con jerarquía)
- `POST /api/folders` - Crear
- `PUT /api/folders/:id` - Actualizar
- `DELETE /api/folders/:id` - Eliminar

### Recursos IA
- `GET /api/ai-resources` - Listar todos
- `POST /api/ai-resources` - Crear
- `PUT /api/ai-resources/:id` - Actualizar
- `DELETE /api/ai-resources/:id` - Eliminar

### Proyectos
- `GET /api/projects` - Listar todos
- `POST /api/projects` - Crear
- `PUT /api/projects/:id` - Actualizar
- `DELETE /api/projects/:id` - Eliminar
- `POST /api/projects/:id/repositories` - Añadir repo
- `DELETE /api/projects/:id/repositories/:repoId` - Quitar repo
- `POST /api/projects/:id/ai-resources` - Añadir IA
- `DELETE /api/projects/:id/ai-resources/:aiId` - Quitar IA
- `POST /api/projects/:id/links` - Añadir enlace
- `DELETE /api/projects/:id/links/:linkId` - Quitar enlace

### Búsqueda
- `GET /api/search?q=query&tags=tag1,tag2` - Búsqueda global
- `GET /api/search/tags` - Obtener todos los tags únicos

## 🎨 Características de UI/UX

- **Tema oscuro** optimizado para uso prolongado
- **Sidebar fijo** con navegación entre secciones
- **Buscador en tiempo real** con resultados categorizados
- **Modales** para formularios de creación/edición
- **Tarjetas expansibles** en proyectos para ver detalles
- **Carpetas colapsables** en recursos IA
- **Soporte Markdown** para notas en proyectos

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev       # Modo desarrollo con nodemon
npm start         # Modo producción
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Aplicar migraciones
npm run prisma:studio    # Abrir Prisma Studio
```

### Frontend
```bash
npm run dev       # Servidor desarrollo
npm run build     # Build producción
npm run preview   # Preview del build
```

## 📈 Próximos Pasos y Escalabilidad

### Mejoras Sugeridas

1. **Filtros Avanzados**
   - Filtrar repos por tecnología y estado
   - Filtrar IAs por tipo
   - Ordenamiento personalizado

2. **Importación Masiva**
   - Importar repos desde GitHub API
   - Importar desde archivo CSV/JSON

3. **Exportación**
   - Exportar datos a JSON
   - Generar reporte PDF de proyectos

4. **Estadísticas**
   - Dashboard con métricas
   - Gráficos de distribución por tags
   - Timeline de actividad

5. **Colaboración**
   - Sistema multi-usuario
   - Permisos y roles
   - Compartir proyectos

6. **Integraciones**
   - GitHub webhooks
   - Notion/Obsidian sync
   - Slack/Discord notificaciones

7. **Mejoras Técnicas**
   - Tests unitarios (Jest, Vitest)
   - CI/CD con GitHub Actions
   - Docker & Docker Compose
   - Rate limiting y caching
   - Validación con Zod

### Arquitectura Escalable

- **Backend**: Fácilmente migrable a NestJS para mayor estructura
- **Database**: PostgreSQL permite escalamiento vertical/horizontal
- **Frontend**: Optimizable con lazy loading y code splitting
- **Deploy**: Compatible con Vercel (frontend) + Railway/Render (backend)

## 🐛 Troubleshooting

**Error: Cannot connect to database**
- Verifica que PostgreSQL esté corriendo
- Revisa credenciales en `.env`
- Verifica que la base de datos existe

**Error: Prisma Client not found**
```bash
cd backend
npx prisma generate
```

**Error: Port already in use**
- Cambia el puerto en `.env` (backend) o `vite.config.js` (frontend)

**Frontend no conecta con backend**
- Verifica que el backend esté corriendo en puerto 3000
- Revisa proxy en `vite.config.js`

## 📝 Licencia

MIT

## 👤 Autor

Proyecto creado como MVP de MySpace - Gestión Personal

---

**¡Listo para usar!** 🎉 Este MVP incluye todo lo necesario para empezar a organizar tus repositorios, IAs y proyectos desde el día uno.