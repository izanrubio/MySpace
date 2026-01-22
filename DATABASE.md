# MySpace - Modelo de Datos

## Diagrama de Relaciones

```
User (1) ──┬── (N) Repository
           │
           ├── (N) Folder ──── (N) Folder (jerarquía)
           │                      │
           │                      └── (N) AIResource
           │
           └── (N) Project ──┬── (M) Repository (ProjectRepository)
                             │
                             ├── (M) AIResource (ProjectAIResource)
                             │
                             └── (N) ProjectLink
```

## Tablas Detalladas

### User
| Campo     | Tipo     | Descripción              |
|-----------|----------|--------------------------|
| id        | UUID     | PK                       |
| email     | String   | Único                    |
| password  | String   | Hash bcrypt              |
| name      | String   |                          |
| createdAt | DateTime |                          |
| updatedAt | DateTime |                          |

### Repository
| Campo       | Tipo     | Descripción                    |
|-------------|----------|--------------------------------|
| id          | UUID     | PK                             |
| name        | String   |                                |
| url         | String   |                                |
| description | String?  |                                |
| technology  | String?  | ej: React, Python, Node.js     |
| tags        | String[] | Array de tags                  |
| status      | String   | active, archived, planning     |
| userId      | UUID     | FK → User                      |
| createdAt   | DateTime |                                |
| updatedAt   | DateTime |                                |

### Folder
| Campo       | Tipo     | Descripción            |
|-------------|----------|------------------------|
| id          | UUID     | PK                     |
| name        | String   |                        |
| description | String?  |                        |
| parentId    | UUID?    | FK → Folder (self)     |
| userId      | UUID     | FK → User              |
| createdAt   | DateTime |                        |
| updatedAt   | DateTime |                        |

### AIResource
| Campo       | Tipo     | Descripción              |
|-------------|----------|--------------------------|
| id          | UUID     | PK                       |
| name        | String   |                          |
| url         | String   |                          |
| type        | String   | web, local, api          |
| description | String?  |                          |
| tags        | String[] | Array de tags            |
| folderId    | UUID?    | FK → Folder              |
| createdAt   | DateTime |                          |
| updatedAt   | DateTime |                          |

### Project
| Campo       | Tipo     | Descripción       |
|-------------|----------|-------------------|
| id          | UUID     | PK                |
| name        | String   |                   |
| description | String?  |                   |
| notes       | String?  | Markdown          |
| userId      | UUID     | FK → User         |
| createdAt   | DateTime |                   |
| updatedAt   | DateTime |                   |

### ProjectRepository (relación M:N)
| Campo      | Tipo     | Descripción       |
|------------|----------|-------------------|
| id         | UUID     | PK                |
| projectId  | UUID     | FK → Project      |
| repoId     | UUID     | FK → Repository   |
| createdAt  | DateTime |                   |

### ProjectAIResource (relación M:N)
| Campo        | Tipo     | Descripción       |
|--------------|----------|-------------------|
| id           | UUID     | PK                |
| projectId    | UUID     | FK → Project      |
| aiResourceId | UUID     | FK → AIResource   |
| createdAt    | DateTime |                   |

### ProjectLink
| Campo     | Tipo     | Descripción    |
|-----------|----------|----------------|
| id        | UUID     | PK             |
| projectId | UUID     | FK → Project   |
| title     | String   |                |
| url       | String   |                |
| createdAt | DateTime |                |

## Índices

- `Repository.userId`, `Repository.tags`
- `Folder.userId`, `Folder.parentId`
- `AIResource.folderId`, `AIResource.tags`, `AIResource.type`
- `Project.userId`
- `ProjectRepository.projectId`, `ProjectRepository.repoId`
- `ProjectAIResource.projectId`, `ProjectAIResource.aiResourceId`
- `ProjectLink.projectId`

## Restricciones

- `ProjectRepository`: unique constraint en `(projectId, repoId)`
- `ProjectAIResource`: unique constraint en `(projectId, aiResourceId)`
- Cascadas de eliminación configuradas en todas las FK
