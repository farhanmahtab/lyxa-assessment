# Edge Cases & Security Analysis

This document provides a critical audit of the current architecture, identifying potential failure points, security considerations, and edge cases that should be monitored or addressed.

## 1. Messaging & Synchronization Edge Cases

### Eventual Consistency & Sync Latency
-   **Scenario**: A user registers in the Auth Service and immediately tries to create a product.
-   **Risk**: If there is high latency in RabbitMQ, the `product_queue` might not have processed the `user.created` event yet.
-   **Result**: The Product Service might not have the user's local record, leading to an initial "User Not Found" error if the local check is performed before the sync completes.
-   **Mitigation**: The system is currently robust because the `AuthGuard` still performs a real-time RPC check if the local user is missing.

### RabbitMQ Downtime
-   **Scenario**: The RabbitMQ broker goes offline.
-   **Risk**: New user registrations will fail if the `AuthService` cannot emit the `user.created` event.
-   **Mitigation**: Implement a **Transactional Outbox Pattern** or a retry mechanism with local buffering to ensure messages are eventually delivered once the broker is back online.

### Duplicate Events (At-Least-Once Delivery)
-   **Scenario**: RabbitMQ redelivers the same `user.created` event due to an unacknowledged message or a network glitch.
-   **Risk**: Potential for multiple synchronization attempts.
-   **Mitigation**: I have used `findOneAndUpdate` with `upsert: true` in the `UsersService` to ensure the operation is **Idempotent**.

## 2. Security Considerations

### JWT Secret Management
-   **Risk**: Both `Auth Service` and `API Gateway` (if validating) share the same `JWT_SECRET`. If this is hardcoded or leaked, the entire identity system is compromised.
-   **Mitigation**: Secrets are currently managed via `.env`. In production, these should be stored in a secure Secret Manager (e.g., AWS Secrets Manager, HashiCorp Vault).

### Direct Service Access
-   **Risk**: While the API Gateway is the intended entry point, the microservices (`3001`, `3002`) are currently exposed directly to the network. An attacker could bypass the Gateway.
-   **Mitigation**: In a production environment (e.g., Kubernetes), services should only be accessible via the internal network, with only the Gateway having an external load balancer.

## 3. Application Failures

### MongoDB Connection Outages
-   **Scenario**: Either the `lyxa_auth` or `lyxa_products` database goes down.
-   **Risk**: Since the services are decoupled, a failure in the Products database does not stop the Auth service from working, but users will be unable to manage products.
-   **Mitigation**: Implement circuit breakers at the API Gateway level to return friendly "Service Unavailable" messages instead of timing out.
