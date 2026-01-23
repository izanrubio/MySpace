# Configuración de GitHub OAuth

Para habilitar la autenticación con GitHub, sigue estos pasos:

## 1. Crear una GitHub OAuth App

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Click en "OAuth Apps" → "New OAuth App"
3. Completa el formulario:
   - **Application name**: MySpace (o el nombre que prefieras)
   - **Homepage URL**: `http://localhost:5173` (en desarrollo)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
4. Click en "Register application"
5. Copia el **Client ID**
6. Click en "Generate a new client secret" y copia el **Client Secret**

## 2. Configurar variables de entorno

### Backend (.env)

Crea o actualiza el archivo `/backend/.env` con:

```env
# GitHub OAuth
GITHUB_CLIENT_ID="tu-client-id-aqui"
GITHUB_CLIENT_SECRET="tu-client-secret-aqui"
GITHUB_CALLBACK_URL="http://localhost:3000/api/auth/github/callback"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Session Secret (genera una clave aleatoria segura)
SESSION_SECRET="tu-session-secret-super-segura-aqui"
```

### Frontend (.env)

Crea o actualiza el archivo `/frontend/.env` con:

```env
VITE_API_URL=http://localhost:3000
```

## 3. Reiniciar los servidores

Después de configurar las variables de entorno, reinicia tanto el backend como el frontend:

```bash
# En el backend
cd backend
npm run dev

# En el frontend (en otra terminal)
cd frontend
npm run dev
```

## 4. Probar la autenticación

1. Abre `http://localhost:5173/login`
2. Click en "Sign in with GitHub"
3. Autoriza la aplicación en GitHub
4. Serás redirigido de vuelta a la aplicación y autenticado automáticamente

## Producción

Para producción, actualiza las URLs en:

1. **GitHub OAuth App**:
   - Homepage URL: `https://tu-dominio.com`
   - Callback URL: `https://tu-dominio.com/api/auth/github/callback`

2. **Variables de entorno**:
   - `GITHUB_CALLBACK_URL`: URL de callback de producción
   - `FRONTEND_URL`: URL del frontend de producción
   - `NODE_ENV`: `production`

## Notas de seguridad

- ⚠️ **NUNCA** compartas tus Client ID y Client Secret públicamente
- ⚠️ Usa secretos diferentes para desarrollo y producción
- ⚠️ Genera claves aleatorias seguras para `SESSION_SECRET` y `JWT_SECRET`
- ⚠️ En producción, asegúrate de usar HTTPS
