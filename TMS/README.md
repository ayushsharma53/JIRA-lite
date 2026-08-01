# Jira Lite Task Management System

Production-shaped Jira Lite built with React 19, TypeScript, Vite, TailwindCSS, shadcn-style UI primitives, Tanstack Query, Zustand, Spring Boot 3, Java 21, JWT cookie auth, PostgreSQL, Flyway and Swagger.

## Structure

```text
backend/
  src/main/java/com/jirolite/
    auth/
    workspace/
    project/
    task/
    common/
  src/main/resources/db/migration/
frontend/
  src/components/
  src/features/
  src/lib/
  src/store/
docker-compose.yml
```

## Local Development

```bash
cp .env.example .env
docker compose up postgres
cd backend && ./mvnw spring-boot:run
cd frontend && npm install && npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8080`  
Swagger: `http://localhost:8080/swagger-ui/index.html`

Seed login:

```text
avery@example.com / password
mina@example.com / password
```

## API

Authentication:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

Workspaces, projects and tasks are under `/api/workspaces`, `/api/projects`, and `/api/tasks`. Task search supports Spring pageable parameters such as:

```text
/api/tasks?page=0&size=10&sort=createdAt,desc&keyword=jwt&status=TODO&priority=HIGH
```

## Deployment

Frontend on Vercel:

```text
Root directory: frontend
Build command: npm run build
Output directory: dist
Environment: VITE_API_URL=https://your-railway-api.up.railway.app
```

Backend on Railway:

```text
Root directory: backend
Builder: Dockerfile
Environment:
DATABASE_URL=jdbc:postgresql://<neon-host>/<db>?sslmode=require
DATABASE_USERNAME=<neon-user>
DATABASE_PASSWORD=<neon-password>
JWT_SECRET=<long-random-secret>
FRONTEND_URL=https://your-vercel-app.vercel.app
COOKIE_SECURE=true
```

Database on Neon PostgreSQL:

Create the database, set the Railway environment variables, and Flyway will apply `V1__init_schema.sql` and `V2__seed_data.sql` on startup.

## Tests

```bash
cd backend && ./mvnw test
cd frontend && npm run build
```

Backend tests include Mockito unit tests and a Testcontainers integration test for auth cookies. Docker must be running for the Testcontainers test.
