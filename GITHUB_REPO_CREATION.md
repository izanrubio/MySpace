# Creación de Repositorios de GitHub desde MySpace

## 🎯 Descripción

Ahora puedes crear repositorios de GitHub directamente desde MySpace con tu cuenta de GitHub iniciada. La aplicación te proporciona automáticamente las URLs de clonación (HTTPS y SSH) después de crear el repositorio.

## ✨ Características

- ✅ Crear repositorios públicos o privados
- ✅ Inicializar automáticamente con README
- ✅ Obtener URLs de clonación (HTTPS y SSH)
- ✅ Copiar URLs al portapapeles con un clic
- ✅ Acceso directo al repositorio en GitHub
- ✅ Guardado automático en tu base de datos local

## 🚀 Cómo Usar

### 1. Iniciar Sesión con GitHub

Primero, asegúrate de haber iniciado sesión con tu cuenta de GitHub. Esto es necesario para obtener los permisos necesarios para crear repositorios.

**Importante:** Si ya tenías una sesión iniciada antes de esta actualización, necesitarás volver a iniciar sesión con GitHub para obtener los nuevos permisos de creación de repositorios.

### 2. Crear un Repositorio

1. Ve a la página de **Repositories** en MySpace
2. Haz clic en el botón **"Create GitHub Repo"** (botón morado con gradiente)
3. Completa el formulario:
   - **Repository Name** (requerido): Nombre del repositorio
   - **Description** (opcional): Descripción del repositorio
   - **Private repository**: Marca esta opción para crear un repositorio privado (recomendado)
   - **Initialize with README**: Marca esta opción para crear un README automáticamente
4. Haz clic en **"Create on GitHub"**

### 3. Obtener Información de Clonación

Después de crear el repositorio, se mostrará automáticamente un modal con:

- ✅ Confirmación de creación exitosa
- 📋 URL de clonación HTTPS (con botón para copiar)
- 🔑 URL de clonación SSH (con botón para copiar)
- 💻 Comandos de inicio rápido
- 🔗 Enlace directo al repositorio en GitHub

### 4. Clonar el Repositorio

Puedes usar cualquiera de las dos URLs para clonar el repositorio:

#### HTTPS (recomendado para principiantes)
```bash
git clone https://github.com/tu-usuario/nombre-repo.git
cd nombre-repo
```

#### SSH (recomendado si tienes SSH configurado)
```bash
git clone git@github.com:tu-usuario/nombre-repo.git
cd nombre-repo
```

## 🔧 Configuración Técnica

### Backend

- **Endpoint**: `POST /api/repositories/github`
- **Autenticación**: Requiere token JWT válido
- **Permisos de GitHub**: Scope `repo` para crear repositorios
- **Librería**: `@octokit/rest` para interactuar con la API de GitHub

### Base de Datos

Se agregó el campo `githubAccessToken` al modelo `User` en Prisma para almacenar el token de acceso de GitHub de forma segura.

### Frontend

- **Componente**: `Repositories.jsx`
- **Modales**: 
  - `GitHub Repository Modal`: Formulario de creación
  - `Clone Info Modal`: Información de clonación

## ⚠️ Notas Importantes

1. **Permisos**: Necesitas haber iniciado sesión con GitHub y haber autorizado los permisos de repositorio
2. **Nombres únicos**: El nombre del repositorio debe ser único en tu cuenta de GitHub
3. **Privacidad**: Por defecto, los repositorios se crean como privados para mayor seguridad
4. **Token de acceso**: El token de GitHub se guarda de forma segura en la base de datos y solo se usa para operaciones autorizadas

## 🐛 Solución de Problemas

### "GitHub account not connected"
- Vuelve a iniciar sesión con GitHub para obtener los nuevos permisos

### "Repository name already exists"
- El nombre del repositorio ya existe en tu cuenta de GitHub
- Elige un nombre diferente

### "GitHub authentication failed"
- Tu token de GitHub puede haber expirado
- Vuelve a iniciar sesión con GitHub

## 📝 Diferencia entre "Create GitHub Repo" y "Add Repo"

- **Create GitHub Repo** (botón morado): Crea un nuevo repositorio en GitHub y lo guarda en MySpace
- **Add Repo** (botón azul): Agrega un repositorio existente a MySpace (solo guarda la referencia)

## 🎨 Interfaz

El botón de "Create GitHub Repo" tiene un diseño especial con gradiente morado-rosa para distinguirlo del botón de agregar repositorio manual, haciendo que sea fácil de identificar y usar.
