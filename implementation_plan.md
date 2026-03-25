# Microservices Architecture Implementation Plan

## Goal Description
Develop two microservices (`Auth Service` and `Product Service`) using NestJS, MongoDB (Typegoose), and RabbitMQ for inter-service communication. The services will be containerized using Docker and orchestrated via Docker Compose.

## User Review Required
> [!NOTE]  
> Please review the chosen tech stack specifics below to ensure they align with your expectations:
> - **Framework**: NestJS (preferred over tRPC for comprehensive microservice support).
> - **Monorepo Structure**: We will use a standard folder structure with two separate NestJS apps in side-by-side directories, sharing a `docker-compose.yml` at the root.
> - **Message Pattern**: We will use RabbitMQ specifically via NestJS's built-in `@nestjs/microservices` module.

## Proposed Changes

---

### Phase 1: Infrastructure & Orchestration setup
We will create a root directory containing both services and the orchestration files.

#### [NEW] docker-compose.yml
- Contains configurations for `mongodb` and `rabbitmq`.
- Eventually will include `auth-service` and `product-service` containers.

#### [NEW] README.md
- Setup instructions, architecture overview, and environment variables template.

---

### Phase 2: Auth Service
The authentication service handles users, JWTs, and publishes events.

#### [NEW] auth-service/src/modules/auth
- **Registration**: Creates a user, hashes the password using bcrypt, and emits a `user.created` event to RabbitMQ.
- **Login**: Verifies credentials and issues Access + Refresh Tokens.
- **Token Validation**: Exposes a MessagePattern (via RabbitMQ) like `{ cmd: 'validate_token' }` that other services can call to check token validity and decode user information.

#### [NEW] auth-service/src/modules/users
- Defines the `User` model using `nestjs-typegoose`.

---

### Phase 3: Product Service
The product service handles the product catalog and validates users via the Auth Service.

#### [NEW] product-service/src/modules/products
- Defines the `Product` model using `nestjs-typegoose`, including an `ownerId` field.
- **CRUD Operations**: Endpoints for Create, Read, Update, Delete.
- **Authorization**: Business logic ensuring operations on a product only proceed if the requesting user's ID matches the product's `ownerId`.

#### [NEW] product-service/src/common/guards/auth.guard.ts
- Custom NestJS Guard that intercepts incoming HTTP requests.
- Extracts the JWT from the `Authorization` header.
- Uses a RabbitMQ ClientProxy to send a `{ cmd: 'validate_token' }` message to the `Auth Service`.
- Attaches the decoded user to the request if valid, or throws an `UnauthorizedException` if invalid.

---

### Phase 4: Dockerization
Each service will be containerized.

#### [NEW] auth-service/Dockerfile
- Multi-stage Node.js build to compile and run the NestJS app.

#### [NEW] product-service/Dockerfile
- Multi-stage Node.js build to compile and run the NestJS app.

## Verification Plan

### Automated Tests
- End-to-end testing (manual via Postman/Swagger or scripted) of the registration and login flows.
- Automated API calls across the Product Service to ensure the JWT validation via RabbitMQ correctly approves or rejects requests.

### Manual Verification
- `docker-compose up --build` successfully starts MongoDB, RabbitMQ, Auth, and Product services.
- Creating a user on Auth Service logs the `user.created` event being published/handled.
- Creating a product requires a valid token. Modifying someone else's product returns a `403 Forbidden`.
