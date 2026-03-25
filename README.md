# Lyxa Microservices Assessment

A microservices-based project featuring an `Auth Service` and a `Product Service` built with **NestJS**, **MongoDB (Typegoose)**, and **RabbitMQ**.

## 🚀 Architecture Overview

- **Auth Service**: Handles user registration, login, JWT management, and token validation.
- **Product Service**: Manages product catalog with ownership-based authorization. Validates tokens by communicating with the Auth Service via RabbitMQ.
- **Inter-service Communication**: Uses RabbitMQ for event-driven updates (e.g., `user.created`) and request-response patterns (e.g., `validate_token`).

## 🛠 Prerequisites

- Docker & Docker Compose
- Node.js (for local development)

## 📦 Setup & Running

### Using Docker Compose (Recommended)

1. Clone the repository.
2. Run the services:
   ```bash
   docker-compose up --build
   ```
3. Services will be available at:
   - Auth Service: `http://localhost:3001`
   - Product Service: `http://localhost:3002`
   - RabbitMQ Management: `http://localhost:15672` (guest/guest)

### Local Development

1. Start MongoDB and RabbitMQ: `docker-compose up -d mongodb rabbitmq`
2. Install dependencies and start Auth Service:
   ```bash
   cd auth-service
   npm install
   npm run start:dev
   ```
3. Install dependencies and start Product Service:
   ```bash
   cd product-service
   npm install
   npm run start:dev
   ```

## 🔐 Environment Variables

### Auth Service (.env)
- `MONGODB_URI`: MongoDB connection string
- `RABBITMQ_URL`: RabbitMQ connection string
- `JWT_SECRET`: Secret key for signing tokens
- `PORT`: 3001

### Product Service (.env)
- `MONGODB_URI`: MongoDB connection string
- `RABBITMQ_URL`: RabbitMQ connection string
- `PORT`: 3002

## 📧 API Endpoints

### Auth Service
- `POST /auth/register`: Register a new user
- `POST /auth/login`: Login and receive Access + Refresh tokens

### Product Service
- `GET /products`: List all products
- `POST /products`: Create a product (Requires JWT Bearer Token)
- `GET /products/:id`: Get product details
- `PATCH /products/:id`: Update product (Requires Ownership)
- `DELETE /products/:id`: Delete product (Requires Ownership)

## ✅ Git Hygiene

This project follows a clean commit history with incremental feature implementation.
