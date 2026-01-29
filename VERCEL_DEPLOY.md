# Guía de Deploy en Vercel - MySpace Frontend

## Problema Resuelto
El error `Cannot read properties of undefined (reading 'rPath')` ha sido solucionado mediante:
1. Configuración correcta de `vercel.json`
2. Optimización de `vite.config.js`
3. Configuración de `.npmrc`

## Pasos para Deploy en Vercel

### 1. Preparación del Proyecto
Asegúrate de que todos los archivos de configuración estén commiteados:
```bash
cd /home/izaanruubiio/Documentos/PROYECTOS/MySpace/frontend
git add vercel.json vite.config.js .npmrc .gitignore
git commit -m "fix: Configuración de Vercel para deploy"
git push
```

### 2. Configuración en Vercel Dashboard

#### Opción A: Deploy desde el Dashboard
1. Ve a [vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Opción B: Deploy desde la CLI
```bash
# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Login en Vercel
vercel login

# Deploy desde el directorio frontend
cd /home/izaanruubiio/Documentos/PROYECTOS/MySpace/frontend
vercel

# Para producción
vercel --prod
```

### 3. Variables de Entorno
En el dashboard de Vercel, añade las siguientes variables de entorno:
- `VITE_API_URL`: URL de tu backend (ej: `https://tu-backend.com`)

**Importante**: Las variables de entorno en Vite deben empezar con `VITE_`

### 4. Configuración del Root Directory
Si estás desplegando desde un monorepo, asegúrate de configurar:
- **Root Directory**: `frontend`

Esto es crucial porque Vercel necesita saber dónde está el `package.json` del frontend.

### 5. Verificación del Build
Antes de hacer deploy, verifica que el build funcione localmente:
```bash
cd /home/izaanruubiio/Documentos/PROYECTOS/MySpace/frontend
npm run build
```

Si el build es exitoso, verás:
```
✓ 263 modules transformed.
dist/index.html                   0.47 kB │ gzip:   0.31 kB
dist/assets/index-Dzo-x2xP.css   19.52 kB │ gzip:   4.43 kB
dist/assets/index-CtTWcGzv.js   387.65 kB │ gzip: 118.51 kB
✓ built in 1.57s
```

## Archivos de Configuración Creados

### vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### vite.config.js
Actualizado con configuración de build optimizada para Vercel.

### .npmrc
Configuración de npm para evitar conflictos de dependencias.

## Solución de Problemas Comunes

### Error: "Cannot read properties of undefined (reading 'rPath')"
**Solución**: Ya resuelto con los archivos de configuración actualizados.

### Error: "Build failed"
**Solución**: 
1. Verifica que el Root Directory esté configurado como `frontend`
2. Asegúrate de que todas las dependencias estén en `package.json`
3. Verifica que no haya errores de TypeScript/ESLint

### Error: "404 en rutas"
**Solución**: El `vercel.json` ya incluye rewrites para manejar React Router.

### Error: "Variables de entorno no definidas"
**Solución**: 
1. Añade las variables en el dashboard de Vercel
2. Asegúrate de que empiecen con `VITE_`
3. Redeploy después de añadir variables

## Notas Importantes

1. **SPA Routing**: El archivo `vercel.json` está configurado para manejar rutas de Single Page Application (SPA).

2. **Cache**: Los assets en `/assets/*` tienen cache de 1 año para mejor performance.

3. **Build Time**: El build debería tomar entre 1-3 minutos.

4. **Logs**: Si hay errores, revisa los logs en el dashboard de Vercel.

## Próximos Pasos

Después del deploy exitoso:
1. Configura un dominio personalizado (opcional)
2. Configura CORS en el backend para permitir requests desde el dominio de Vercel
3. Actualiza las variables de entorno con las URLs de producción

## Soporte

Si encuentras algún error:
1. Revisa los logs en Vercel Dashboard
2. Verifica que el build funcione localmente
3. Asegúrate de que todas las configuraciones estén correctas
