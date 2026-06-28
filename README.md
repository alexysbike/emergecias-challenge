# Emergencias Challenge API

Contact agenda REST API built with TypeScript, Express, Drizzle ORM (SQLite), and Zod.

**Languages:** [English](#english) · [Español](#español)

---

## English

### Overview

REST API to manage contacts (persons), their phones, addresses, and activities. It follows a lightweight Clean Architecture: domain ports, application use cases, infrastructure adapters, and an HTTP presentation layer.

### Requirements

- **Node.js** 20+ (LTS recommended)
- **npm** 10+

Native build tools may be required for `better-sqlite3` (`python`, `make`, etc. on some systems).

### Installation

```bash
git clone <repository-url>
cd emergencias-challenge
npm install
```

### Configuration

Environment variables (all optional):

| Variable        | Default         | Description                                     |
| --------------- | --------------- | ----------------------------------------------- |
| `PORT`          | `3000`          | HTTP server port                                |
| `DATABASE_PATH` | `./data/app.db` | SQLite database file path                       |
| `NODE_ENV`      | `development`   | `development` \| `production` \| `test`         |
| `LOG_LEVEL`     | auto by env     | Pino log level (`debug`, `info`, `silent`, …) |

The `data/` directory is created automatically. It is gitignored.

### Database

Migrations run automatically on server startup. Phone types (`Mobile`, `Home`, `Work`) are seeded automatically if the table is empty.

Manual commands:

```bash
npm run db:generate   # Generate migrations after schema changes (drizzle-kit)
npm run db:migrate    # Apply pending migrations
npm run db:seed       # Seed phone types manually
npm run db:studio     # Open Drizzle Studio (DB browser)
```

### Running the application

**Development** (hot reload with `tsx`):

```bash
npm run dev
```

**Production**:

```bash
npm run build
npm start
```

On startup the server:

1. Runs pending migrations
2. Regenerates `openapi/swagger.json`
3. Listens on the configured port

**Health check:** `GET http://localhost:3000/health` → `{ "status": "ok" }`

**API documentation (dev only):** [http://localhost:3000/doc](http://localhost:3000/doc) (Swagger UI; not available when `NODE_ENV=production`)

### API endpoints

Base URL: `/` · Format: JSON · Charset: UTF-8

| Method   | Route                                | Description                        |
| -------- | ------------------------------------ | ---------------------------------- |
| `GET`    | `/health`                            | Health check                       |
| `POST`   | `/contacts`                          | Create contact                     |
| `GET`    | `/contacts`                          | List / search contacts (paginated) |
| `GET`    | `/contacts/:id`                      | Get contact by ID                  |
| `PATCH`  | `/contacts/:id`                      | Update contact personal data       |
| `DELETE` | `/contacts/:id`                      | Delete contact (cascade)           |
| `POST`   | `/contacts/:id/activities`           | Create activity                    |
| `GET`    | `/contacts/:id/activities`           | List activities for contact        |
| `POST`   | `/contacts/:id/phones`               | Add phone to contact               |
| `GET`    | `/contacts/:id/phones`               | List phones                        |
| `GET`    | `/contacts/:id/phones/:phoneId`      | Get phone                          |
| `PATCH`  | `/contacts/:id/phones/:phoneId`      | Update phone                       |
| `DELETE` | `/contacts/:id/phones/:phoneId`      | Delete phone                       |
| `POST`   | `/contacts/:id/addresses`            | Add address to contact             |
| `GET`    | `/contacts/:id/addresses`            | List addresses                     |
| `GET`    | `/contacts/:id/addresses/:addressId` | Get address                        |
| `PATCH`  | `/contacts/:id/addresses/:addressId` | Update address                     |
| `DELETE` | `/contacts/:id/addresses/:addressId` | Delete address                     |

**Error response format:**

```json
{
  "error": "Human-readable error description",
  "code": "VALIDATION_ERROR"
}
```

Codes: `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`, `METHOD_NOT_ALLOWED`.

Full API spec: see [`specs/endpoints.md`](specs/endpoints.md) and [`openapi/swagger.json`](openapi/swagger.json).

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report (output in coverage/)
```

**Strategy:**

| Layer          | What is tested            | How                                     |
| -------------- | ------------------------- | --------------------------------------- |
| Application    | Use cases, business rules | Unit tests with mocked repository ports |
| Presentation   | HTTP contract             | Integration tests with Supertest        |
| Infrastructure | Router flattening, etc.   | Unit / integration tests                |

Tests use an in-memory SQLite database (`:memory:`). They never touch the production `data/` directory.

### Code quality

```bash
npm run lint          # ESLint (src + tests)
npm run lint:fix      # Auto-fix lint issues
npm run format        # Prettier write
npm run format:check  # Prettier check (CI-friendly)
npm run validate      # lint + format:check + test + build
```

Generate OpenAPI without starting the server:

```bash
npm run openapi:generate
```

### Tech stack

| Category      | Tools                                              |
| ------------- | -------------------------------------------------- |
| Runtime       | Node.js, TypeScript                                |
| HTTP          | Express 5                                          |
| Validation    | Zod 4                                              |
| Database      | SQLite via Drizzle ORM + better-sqlite3            |
| OpenAPI       | @asteasolutions/zod-to-openapi, swagger-ui-express |
| Logging       | Pino + pino-http                                   |
| Testing       | Jest, ts-jest, Supertest                           |
| Lint / format | ESLint 10 (flat config), Prettier                  |

### Design decisions

1. **Lightweight Clean Architecture** — Layers: Domain → Application → Infrastructure / Presentation. Inner layers never import outer ones. No event bus or CQRS; one use case per operation.

2. **Framework at the edge** — Express lives only under `infrastructure/http/express`. Routes depend on framework-agnostic `HttpRoute`, `HttpRouter`, and `HttpServer` abstractions.

3. **Single validation source** — Zod schemas in `presentation/validators/` drive runtime validation and OpenAPI generation.

4. **Explicit errors** — Use cases throw typed `AppError` subclasses; a centralized middleware maps them to HTTP responses.

5. **Class-based routing** — Each endpoint is an `HttpRoute` subclass; routers group related routes and support nesting (e.g. activities under contacts).

6. **SQLite for simplicity** — File-based DB, zero external services, suitable for a challenge/demo. Migrations are versioned with Drizzle Kit.

7. **OpenAPI on bootstrap** — Spec is regenerated on every start so it stays in sync with Zod schemas. Swagger UI at `/doc` is dev-only.

8. **Composition root** — `src/composition/` wires DB → repositories → use cases → routes in one place, easy to swap for tests.

### Project structure

```
src/
├── domain/           # Entities and repository ports
├── application/      # Use cases and DTOs
├── infrastructure/   # Drizzle, Express adapter, logging
├── presentation/     # Routes, validators, mappers, OpenAPI
├── shared/           # Errors, config
├── composition/      # Dependency wiring
└── index.ts          # Bootstrap

tests/
├── unit/
├── integration/
└── helpers/          # test-db, test-app

specs/                # Detailed specs (architecture, models, endpoints)
openapi/              # Generated swagger.json
```

Detailed architecture: [`specs/architecture.md`](specs/architecture.md).

### Out of scope

- Authentication / authorization
- Docker / deployment
- GraphQL or tRPC

---

## Español

### Descripción general

API REST para gestionar contactos (personas), sus teléfonos, direcciones y actividades. Implementa una Clean Architecture ligera: puertos de dominio, casos de uso, adaptadores de infraestructura y capa de presentación HTTP.

### Requisitos

- **Node.js** 20+ (se recomienda LTS)
- **npm** 10+

En algunos sistemas, `better-sqlite3` requiere herramientas de compilación nativas (`python`, `make`, etc.).

### Instalación

```bash
git clone <url-del-repositorio>
cd emergencias-challenge
npm install
```

### Configuración

Variables de entorno (todas opcionales):

| Variable        | Valor por defecto | Descripción                                      |
| --------------- | ----------------- | ------------------------------------------------ |
| `PORT`          | `3000`            | Puerto del servidor HTTP                         |
| `DATABASE_PATH` | `./data/app.db`   | Ruta del archivo SQLite                          |
| `NODE_ENV`      | `development`     | `development` \| `production` \| `test`          |
| `LOG_LEVEL`     | según entorno     | Nivel de log Pino (`debug`, `info`, `silent`, …) |

El directorio `data/` se crea automáticamente y está en `.gitignore`.

### Base de datos

Las migraciones se ejecutan al iniciar el servidor. Los tipos de teléfono (`Mobile`, `Home`, `Work`) se siembran automáticamente si la tabla está vacía.

Comandos manuales:

```bash
npm run db:generate   # Generar migraciones tras cambios en el schema
npm run db:migrate    # Aplicar migraciones pendientes
npm run db:seed       # Sembrar tipos de teléfono manualmente
npm run db:studio     # Abrir Drizzle Studio (explorador de BD)
```

### Ejecución

**Desarrollo** (recarga en caliente con `tsx`):

```bash
npm run dev
```

**Producción**:

```bash
npm run build
npm start
```

Al arrancar, el servidor:

1. Aplica migraciones pendientes
2. Regenera `openapi/swagger.json`
3. Escucha en el puerto configurado

**Health check:** `GET http://localhost:3000/health` → `{ "status": "ok" }`

**Documentación API (solo dev):** [http://localhost:3000/doc](http://localhost:3000/doc) (Swagger UI; no disponible con `NODE_ENV=production`)

### Endpoints de la API

URL base: `/` · Formato: JSON · Charset: UTF-8

| Método   | Ruta                                 | Descripción                          |
| -------- | ------------------------------------ | ------------------------------------ |
| `GET`    | `/health`                            | Verificación de salud                |
| `POST`   | `/contacts`                          | Crear contacto                       |
| `GET`    | `/contacts`                          | Listar / buscar contactos (paginado) |
| `GET`    | `/contacts/:id`                      | Obtener contacto por ID              |
| `PATCH`  | `/contacts/:id`                      | Actualizar datos personales          |
| `DELETE` | `/contacts/:id`                      | Eliminar contacto (cascada)          |
| `POST`   | `/contacts/:id/activities`           | Crear actividad                      |
| `GET`    | `/contacts/:id/activities`           | Listar actividades del contacto      |
| `POST`   | `/contacts/:id/phones`               | Agregar teléfono                     |
| `GET`    | `/contacts/:id/phones`               | Listar teléfonos                     |
| `GET`    | `/contacts/:id/phones/:phoneId`      | Obtener teléfono                     |
| `PATCH`  | `/contacts/:id/phones/:phoneId`      | Actualizar teléfono                  |
| `DELETE` | `/contacts/:id/phones/:phoneId`      | Eliminar teléfono                    |
| `POST`   | `/contacts/:id/addresses`            | Agregar dirección                    |
| `GET`    | `/contacts/:id/addresses`            | Listar direcciones                   |
| `GET`    | `/contacts/:id/addresses/:addressId` | Obtener dirección                    |
| `PATCH`  | `/contacts/:id/addresses/:addressId` | Actualizar dirección                 |
| `DELETE` | `/contacts/:id/addresses/:addressId` | Eliminar dirección                   |

**Formato de error:**

```json
{
  "error": "Descripción legible del error",
  "code": "VALIDATION_ERROR"
}
```

Códigos: `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`, `METHOD_NOT_ALLOWED`.

Especificación completa: [`specs/endpoints.md`](specs/endpoints.md) y [`openapi/swagger.json`](openapi/swagger.json).

### Testing

```bash
npm test              # Ejecutar todos los tests
npm run test:watch    # Modo watch
npm run test:coverage # Reporte de cobertura (salida en coverage/)
```

**Estrategia:**

| Capa           | Qué se prueba                   | Cómo                               |
| -------------- | ------------------------------- | ---------------------------------- |
| Application    | Casos de uso, reglas de negocio | Tests unitarios con repos mockeados |
| Presentation   | Contrato HTTP                   | Tests de integración con Supertest |
| Infrastructure | Aplanado de routers, etc.       | Tests unitarios / integración      |

Los tests usan SQLite en memoria (`:memory:`). No tocan el directorio `data/` de producción.

### Calidad de código

```bash
npm run lint          # ESLint (src + tests)
npm run lint:fix      # Corregir issues de lint
npm run format        # Formatear con Prettier
npm run format:check  # Verificar formato (CI)
npm run validate      # lint + format:check + test + build
```

Generar OpenAPI sin levantar el servidor:

```bash
npm run openapi:generate
```

### Stack tecnológico

| Categoría      | Herramientas                                       |
| -------------- | -------------------------------------------------- |
| Runtime        | Node.js, TypeScript                                |
| HTTP           | Express 5                                          |
| Validación     | Zod 4                                              |
| Base de datos  | SQLite con Drizzle ORM + better-sqlite3            |
| OpenAPI        | @asteasolutions/zod-to-openapi, swagger-ui-express |
| Logging        | Pino + pino-http                                   |
| Testing        | Jest, ts-jest, Supertest                           |
| Lint / formato | ESLint 10 (flat config), Prettier                  |

### Decisiones de diseño

1. **Clean Architecture ligera** — Capas: Domain → Application → Infrastructure / Presentation. Las capas internas no importan las externas. Un caso de uso por operación; sin event bus ni CQRS.

2. **Framework en el borde** — Express solo en `infrastructure/http/express`. Las rutas usan abstracciones `HttpRoute`, `HttpRouter` y `HttpServer` independientes del framework.

3. **Validación única** — Los schemas Zod en `presentation/validators/` validan en runtime y generan OpenAPI.

4. **Errores explícitos** — Los casos de uso lanzan `AppError` tipados; un middleware central los mapea a respuestas HTTP.

5. **Routing basado en clases** — Cada endpoint es una subclase de `HttpRoute`; los routers agrupan rutas y permiten anidamiento (p. ej. actividades bajo contactos).

6. **SQLite por simplicidad** — BD en archivo, sin servicios externos, adecuada para un challenge/demo. Migraciones versionadas con Drizzle Kit.

7. **OpenAPI al arrancar** — La spec se regenera en cada inicio para mantenerla alineada con Zod. Swagger UI en `/doc` solo en desarrollo.

8. **Composition root** — `src/composition/` conecta BD → repos → casos de uso → rutas; fácil de reemplazar en tests.

### Estructura del proyecto

```
src/
├── domain/           # Entidades y puertos de repositorio
├── application/      # Casos de uso y DTOs
├── infrastructure/   # Drizzle, adaptador Express, logging
├── presentation/     # Rutas, validadores, mappers, OpenAPI
├── shared/           # Errores, config
├── composition/      # Inyección de dependencias
└── index.ts          # Bootstrap

tests/
├── unit/
├── integration/
└── helpers/          # test-db, test-app

specs/                # Specs detalladas (arquitectura, modelos, endpoints)
openapi/              # swagger.json generado
```

Arquitectura detallada: [`specs/architecture.md`](specs/architecture.md).

### Fuera de alcance

- Autenticación / autorización
- Docker / despliegue
- GraphQL o tRPC

---

## License

ISC
