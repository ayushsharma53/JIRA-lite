# 🚀 Jira Lite - Project Management System

A production-ready **Jira-inspired Task Management Platform** built with **Spring Boot** and **React** that enables teams to organize workspaces, manage projects, assign tasks, and collaborate efficiently. Designed using modern backend architecture, secure JWT authentication, RESTful APIs, and scalable development practices.

## ✨ Features

- 🔐 JWT Authentication & Authorization
- 👥 Role-Based Access Control (Admin / Member)
- 🏢 Workspace Management
- 📁 Project Management
- ✅ Task Creation & Assignment
- 📌 Task Status & Priority Management
- 🔍 Advanced Search & Filtering
- 📄 Pagination & Sorting
- 📝 Task Comments
- 📚 Interactive Swagger API Documentation
- 🗄️ Database Versioning with Flyway
- 🐳 Dockerized Development Environment

---

## 🛠️ Tech Stack

### Backend
- Spring Boot 3
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- PostgreSQL
- Flyway
- MapStruct
- Maven
- Swagger / OpenAPI

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Zustand

### DevOps
- Docker
- Docker Compose

---

## 📂 Project Structure

```text
backend/
 ├── auth/
 ├── workspace/
 ├── project/
 ├── task/
 ├── common/
 └── resources/db/migration/

frontend/
 ├── components/
 ├── features/
 ├── lib/
 └── store/

docker-compose.yml
```

---

## 🏗️ Architecture

```text
Client
   │
   ▼
Spring Security (JWT)
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Repositories
   │
   ▼
PostgreSQL
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/<your-username>/jira-lite.git
cd jira-lite
```

### Start PostgreSQL

```bash
docker compose up postgres
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Local URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui/index.html |

---

## 🔑 Demo Credentials

```text
avery@example.com / password

mina@example.com / password
```

---

## 📚 REST APIs

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Core Modules

```text
/api/workspaces
/api/projects
/api/tasks
```

### Example Search

```text
GET /api/tasks?page=0&size=10&sort=createdAt,desc&keyword=jwt&status=TODO&priority=HIGH
```

---

## 🧪 Testing

```bash
cd backend
./mvnw test

cd frontend
npm run build
```

Backend includes:
- Unit Testing (Mockito)
- Integration Testing (Testcontainers)

---

## 📖 Key Backend Concepts Demonstrated

- RESTful API Design
- JWT Authentication
- Layered Architecture
- DTO Pattern
- Repository Pattern
- Dependency Injection
- Validation
- Global Exception Handling
- Dynamic Querying with Specifications
- Database Migrations with Flyway
- Dockerized Development

---

## ⭐ Future Enhancements

- Email Notifications
- File Attachments
- Activity Timeline
- WebSocket Notifications
- Analytics Dashboard
- CI/CD Pipeline
