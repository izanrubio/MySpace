# 🛠️ Scripts de Utilidad - MySpace Backend

Este directorio contiene scripts útiles para el desarrollo y mantenimiento de la aplicación.

## 📁 Scripts Disponibles

### 1. `fix-user-projects.js` - Consolidador de Proyectos

**Propósito:** Soluciona el problema de proyectos no visibles cuando tienes múltiples usuarios en desarrollo.

**¿Qué hace?**
- 🔍 Busca todos los usuarios en la base de datos
- 📊 Muestra cuántos proyectos tiene cada usuario
- 🔄 **Asigna todos los recursos al primer usuario** encontrado:
  - Proyectos
  - Repositorios
  - Carpetas
  - Recursos de IA
  - Lenguajes

**Cuándo usarlo:**
- ✅ Cuando crees proyectos con diferentes usuarios y no los veas
- ✅ Para consolidar todo bajo un solo usuario durante desarrollo
- ✅ Después de hacer pruebas con múltiples cuentas

**Cómo ejecutarlo:**
```bash
node fix-user-projects.js
```

**Ejemplo de salida:**
```
📊 Usuarios encontrados: 2
  1. admin@myspace.com (ID: d2fb8d3e-8743-4a7b-bd78-9ba8cf435f24)
  2. user@example.com (ID: e69a7747-aa90-4d18-aafd-aea0e99d0c77)

✅ Usuario principal seleccionado: admin@myspace.com

📁 Proyectos totales: 5

📊 Distribución de proyectos por usuario:
  - admin@myspace.com: 1 proyectos
  - user@example.com: 4 proyectos

🔄 Asignando todos los proyectos a: admin@myspace.com...
✅ 4 proyectos actualizados
✅ 12 repositorios actualizados
✅ 4 carpetas actualizadas
✅ 0 lenguajes actualizados

✨ ¡Todos los recursos ahora pertenecen a un solo usuario!
```

---

### 2. `generate-token.js` - Generador de Tokens JWT

**Propósito:** Genera un token JWT válido para autenticarte rápidamente sin hacer login.

**¿Qué hace?**
- 🔑 Genera un token JWT para `admin@myspace.com`
- ⏰ El token dura **7 días**
- 📋 Te da el comando exacto para copiarlo en localStorage

**Cuándo usarlo:**
- ✅ Cuando pierdas la sesión o el token expire
- ✅ Para autenticarte rápidamente durante desarrollo
- ✅ Para probar la aplicación sin hacer login manual
- ✅ Cuando veas "No projects found" pero sepas que hay proyectos en la BD

**Cómo ejecutarlo:**
```bash
node generate-token.js
```

**Ejemplo de salida:**
```
✅ Token generado para: admin@myspace.com

🔑 Token JWT:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkMmZiOGQzZS04NzQzLTRhN2ItYmQ3OC05YmE4Y2Y0MzVmMjQiLCJpYXQiOjE3Njk3OTEwNzksImV4cCI6MTc3MDM5NTg3OX0.0dqam1uVFtQwukmQ2k5ESA_0C2QEhx8kgzZFSHe4oc8

📋 Copia este token y úsalo en el frontend:

1. Abre la consola del navegador (F12)
2. Ejecuta: localStorage.setItem("token", "eyJhbGci...")
3. Recarga la página

✨ ¡Deberías ver todos tus proyectos!
```

**Pasos para usar el token:**
1. Ejecuta el script
2. Copia el token generado
3. Abre tu navegador en `http://localhost:5173`
4. Abre la consola (F12)
5. Pega el comando `localStorage.setItem(...)` que te da el script
6. Recarga la página (F5)
7. ¡Listo! Estarás autenticado

---

## 🗄️ Seed de Base de Datos

### `prisma/seed.js` - Limpieza de Base de Datos

**Propósito:** Limpia completamente la base de datos, dejándola vacía.

**¿Qué hace?**
- 🧹 Elimina TODOS los datos de todas las tablas
- ✨ Deja la base de datos completamente limpia
- 📝 No crea ningún dato de ejemplo

**Cómo ejecutarlo:**
```bash
npx prisma db seed
```

**Salida:**
```
🌱 Starting database cleanup...
🧹 Deleting all data...
✨ Database is now completely empty!

📝 Next steps:
  1. Register a new user in the app
  2. Start creating your projects, repos, and AI resources

✅ Seed finished successfully
```

**⚠️ ADVERTENCIA:** Este comando elimina TODOS los datos. Úsalo solo cuando quieras empezar de cero.

---

## 🔧 Casos de Uso Comunes

### Problema: "No veo mis proyectos"

**Solución paso a paso:**

1. **Verifica en Prisma Studio** si los proyectos existen:
   ```bash
   npx prisma studio
   ```
   - Ve a la tabla `Project`
   - Verifica que hay proyectos
   - Anota el `userId` de los proyectos

2. **Consolida los proyectos** bajo un solo usuario:
   ```bash
   node fix-user-projects.js
   ```

3. **Genera un token** para ese usuario:
   ```bash
   node generate-token.js
   ```

4. **Usa el token** en el navegador (sigue las instrucciones del script)

5. **Recarga** la página y deberías ver todos los proyectos

---

### Problema: "Quiero empezar de cero"

**Solución:**

1. **Limpia la base de datos:**
   ```bash
   npx prisma db seed
   ```

2. **Regístrate** en la aplicación con un nuevo usuario

3. **Empieza a crear** tus proyectos, repos y recursos

---

## 📝 Notas Importantes

- 🔐 Estos scripts son **solo para desarrollo**
- 🚫 **NO** los uses en producción
- 💾 Siempre haz backup de tu base de datos antes de ejecutar scripts de limpieza
- 🔑 Los tokens generados expiran en 7 días
- 👤 Por defecto, los scripts buscan el usuario `admin@myspace.com`

---

## 🐛 Debugging

Si tienes problemas:

1. **Verifica que el backend esté corriendo:**
   ```bash
   npm run dev
   ```

2. **Verifica la conexión a la base de datos:**
   ```bash
   npx prisma studio
   ```

3. **Verifica las variables de entorno:**
   ```bash
   cat .env | grep -E "(DATABASE_URL|JWT_SECRET)"
   ```

4. **Regenera el cliente de Prisma:**
   ```bash
   npx prisma generate
   ```

---

¿Necesitas ayuda? Revisa los logs del backend o contacta al equipo de desarrollo.
