# 🔔 Sistema de Compartir Proyectos y Notificaciones

## 📋 Descripción General

Se ha implementado un sistema completo para compartir proyectos entre usuarios registrados y recibir notificaciones en tiempo real.

---

## ✨ Características Implementadas

### 1. **Compartir Proyectos**
- Compartir proyectos con otros usuarios por email
- Dos roles disponibles:
  - **Viewer**: Solo lectura
  - **Editor**: Puede editar (preparado para futuras implementaciones)
- Validación de usuarios existentes
- Prevención de duplicados

### 2. **Sistema de Notificaciones**
- Campana de notificaciones en el header (al lado del botón de tema)
- Badge con contador de notificaciones no leídas
- Actualización automática cada 30 segundos
- Dropdown con lista completa de notificaciones
- Acciones disponibles:
  - ✅ Aceptar invitación
  - ❌ Rechazar invitación
  - 📖 Marcar como leída
  - 🗑️ Eliminar notificación
  - 📚 Marcar todas como leídas

### 3. **Base de Datos**
- Nuevas tablas:
  - `ProjectShare`: Gestiona qué usuarios tienen acceso a qué proyectos
  - `Notification`: Almacena todas las notificaciones

---

## 🎯 Flujo de Uso

### **Compartir un Proyecto:**

1. Ve al detalle de un proyecto (doble clic en la tarjeta)
2. Haz clic en el botón **"Compartir"** (azul, con icono de compartir)
3. Introduce el **email** del usuario con el que quieres compartir
4. Selecciona el **rol** (Viewer o Editor)
5. Haz clic en **"Enviar Invitación"**
6. El usuario recibirá una notificación

### **Recibir y Aceptar Invitación:**

1. Verás un **badge rojo** en la campana de notificaciones (arriba a la derecha)
2. Haz clic en la **campana** para abrir el dropdown
3. Verás la invitación con:
   - Título: "Invitación a proyecto"
   - Mensaje: Quién te invitó y a qué proyecto
   - Nombre del proyecto
4. Haz clic en **"Aceptar"** para aceptar la invitación
   - Te redirigirá automáticamente al proyecto
   - Tendrás acceso al proyecto compartido
5. O haz clic en **"Rechazar"** para rechazar la invitación
   - La notificación se eliminará

---

## 🗂️ Estructura de Archivos

### **Backend:**

```
backend/
├── prisma/
│   └── schema.prisma          # Modelos: ProjectShare, Notification
├── src/
│   ├── routes/
│   │   ├── projects.js        # Rutas de compartir: POST /:id/share
│   │   └── notifications.js   # CRUD de notificaciones
│   └── index.js               # Registro de rutas
```

### **Frontend:**

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Incluye NotificationBell
│   │   └── NotificationBell.jsx  # Componente de campana
│   ├── pages/
│   │   └── ProjectDetail.jsx  # Botón y modal de compartir
│   └── services/
│       └── api.js             # Funciones API para compartir y notificaciones
```

---

## 🔌 API Endpoints

### **Proyectos:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/projects/:id/share` | Compartir proyecto con usuario |
| GET | `/api/projects/:id/shares` | Obtener usuarios con acceso |
| DELETE | `/api/projects/:id/shares/:userId` | Remover acceso de usuario |

**Body para compartir:**
```json
{
  "email": "usuario@ejemplo.com",
  "role": "viewer"  // o "editor"
}
```

### **Notificaciones:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notifications` | Obtener todas las notificaciones |
| GET | `/api/notifications/unread-count` | Contador de no leídas |
| PUT | `/api/notifications/:id/read` | Marcar como leída |
| PUT | `/api/notifications/mark-all-read` | Marcar todas como leídas |
| DELETE | `/api/notifications/:id` | Eliminar notificación |
| POST | `/api/notifications/:id/accept` | Aceptar invitación |
| POST | `/api/notifications/:id/reject` | Rechazar invitación |

---

## 🎨 Componentes UI

### **NotificationBell.jsx**

Componente de campana de notificaciones con:
- Badge animado con contador
- Dropdown con scroll
- Formato de fecha relativo ("Hace 5m", "Hace 2h", etc.)
- Indicador visual de no leídas (punto azul)
- Botones de acción contextuales
- Polling automático cada 30 segundos
- Click fuera para cerrar

### **ProjectDetail.jsx - Modal de Compartir**

Modal con:
- Input de email con validación
- Selector de rol (Viewer/Editor)
- Validación de formulario
- Mensajes de error/éxito
- Diseño consistente con el resto de la app

---

## 🔐 Seguridad

- ✅ Autenticación JWT requerida para todas las rutas
- ✅ Validación de propiedad del proyecto antes de compartir
- ✅ Prevención de auto-compartir
- ✅ Prevención de duplicados
- ✅ Validación de usuario existente por email
- ✅ Filtrado de notificaciones por usuario

---

## 📊 Modelos de Base de Datos

### **ProjectShare**

```prisma
model ProjectShare {
  id        String   @id @default(uuid())
  projectId String
  userId    String
  role      String   @default("viewer")  // viewer, editor
  createdAt DateTime @default(now())

  project Project @relation("SharedProjects")
  user    User

  @@unique([projectId, userId])
}
```

### **Notification**

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String   // project_invite, etc.
  title     String
  message   String
  data      Json?    // { projectId, role, invitedBy }
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User
  project   Project?
  projectId String?
}
```

---

## 🧪 Cómo Probar

### **Preparación:**

1. Asegúrate de tener al menos 2 usuarios registrados
2. Crea un proyecto con el Usuario A
3. Anota el email del Usuario B

### **Prueba del Flujo Completo:**

**Como Usuario A (propietario):**
1. Abre el proyecto
2. Haz clic en "Compartir"
3. Introduce el email del Usuario B
4. Selecciona "Viewer"
5. Envía la invitación

**Como Usuario B (invitado):**
1. Verás el badge rojo en la campana (puede tardar hasta 30s)
2. Abre las notificaciones
3. Verás la invitación
4. Haz clic en "Aceptar"
5. Serás redirigido al proyecto compartido

---

## 🐛 Troubleshooting

### **No aparece el badge de notificaciones:**
- Espera 30 segundos (polling automático)
- Recarga la página
- Verifica que el backend esté corriendo

### **Error "User not found":**
- Verifica que el email sea exacto
- El usuario debe estar registrado en la aplicación

### **Error "Project already shared":**
- El proyecto ya está compartido con ese usuario
- Revisa en `/api/projects/:id/shares`

### **No puedo ver el proyecto compartido:**
- Asegúrate de haber aceptado la invitación
- Verifica que el backend haya creado el `ProjectShare`
- Revisa Prisma Studio

---

## 🚀 Futuras Mejoras

- [ ] Implementar permisos de edición para role "editor"
- [ ] Notificaciones en tiempo real con WebSockets
- [ ] Lista de usuarios con acceso en ProjectDetail
- [ ] Revocar acceso desde ProjectDetail
- [ ] Notificaciones push del navegador
- [ ] Filtros de notificaciones por tipo
- [ ] Búsqueda de usuarios por nombre
- [ ] Compartir con múltiples usuarios a la vez
- [ ] Historial de actividad del proyecto
- [ ] Comentarios en proyectos compartidos

---

## 📝 Notas Importantes

- Las notificaciones se actualizan automáticamente cada 30 segundos
- El badge muestra "9+" si hay más de 9 notificaciones no leídas
- Al aceptar una invitación, se crea automáticamente el `ProjectShare`
- Al rechazar, solo se elimina la notificación
- Los proyectos compartidos aparecerán en la lista de proyectos del usuario invitado (funcionalidad pendiente de implementar en el frontend)

---

¡El sistema está completamente funcional y listo para usar! 🎉
