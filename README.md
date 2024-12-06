Node.js RBAC Authorization API

This project demonstrates a Role-Based Access Control (RBAC) system using Node.js. It provides functionality for managing users, roles, permissions, and blogs with a secure and scalable architecture.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Environment Setup](#environment-setup)
3. [Getting Started](#getting-started)
4. [Deep Dive into the Project](#deep-dive-into-the-project)
5. [Authorization Workflow](#authorization-workflow)
6. [API Overview](#api-overview)
7. [Default Accounts](#default-accounts)
8. [Project Structure](#project-structure)
9. [Security](#security)

---

## Introduction

This RBAC API provides an efficient way to:

-   Authenticate users.
-   Assign roles and permissions.
-   Define role-specific access controls.
-   Manage blogs and products as examples of controlled resources.

The system uses **roles** and **permission groups** to restrict or allow access to various endpoints. Default roles include `admin`, `editor`, and `viewer`. It ensures fine-grained access control for every operation.

---

## Environment Setup

### Prerequisites

-   **Node.js** >= 18.x
-   **MongoDB** (for storing user, role, and permission data)
-   **Redis** (for session management)

Which will be installed in [Getting Started](#getting-started)

---

## Getting Started

1. **Create `.env` file:**

    - Duplicate the sample environment file by running:
        ```bash
        cp env.sample .env
        ```

2. **Start the server:**

    - Build and run the application using Docker Compose:
        ```bash
        docker compose up --build
        ```
    - The server will be available at `http://localhost:3000`. Adjust the port in `.env` if needed.

3. **Test the API:**
    - Use tools like Postman or Insomnia to interact with API endpoints.
    - A Postman collection is available in the project root for quick setup (`NodeJS RBAC Authorization.postman_collection.json`)

**Important Note:**

-   The app comes with 3 default users, 3 predefined roles, and 7 permission groups to get you started. You can customize and expand the roles, users, and permissions as needed.

---

## Deep Dive into the Project

### Core Concepts

The app revolves around two key entities:

-   **Role**: Defines a set of permissions.
-   **Permission Group**: Groups related permissions (e.g., `BLOG:CREATE`, `PRODUCT:UPDATE`).

Each user is assigned one role, which can be predefined (`admin`, `editor`, `viewer`) or custom. Roles determine access rights by linking to specific permission groups.

### Workflow

1. **User Role Assignment**: Assign a role to each user during registration or through role management endpoints.
2. **Permission Evaluation**: Verify user permissions for each request based on their role.
3. **Controlled Access**: Ensure only authorized users can perform sensitive operations.

---

## Authorization Workflow

The app uses the middleware `rbac.middleware.ts` (`authorize` function) to enforce role-based access control. Here’s how it works:

1. **Extract Role**: The middleware extracts the user's role from the JWT in the request header.
2. **Fetch Permissions**: It retrieves permissions associated with the user’s role.
3. **Validate Access**: It compares the requested action against the user’s permissions.
4. **Grant/Deny**: If authorized, the request proceeds; otherwise, it is rejected.

---

## API Overview

### 1. Authentication

-   **Register**: Register a user with email, password, and role.
-   **Login**: Authenticate and receive a JWT.
-   **Refresh Token**: Obtain a new access token.
-   **Logout**: Invalidate the current session.

### 2. Role Management

-   **Create Role**: Add a new role with associated permissions.
-   **Assign Role**: Assign a role to a user.
-   **Manage Groups**: Add or remove permission groups from roles.

### 3. Permission Groups

-   **Create Group**: Define a new permission group with specific actions.
-   **List Groups**: Retrieve all existing permission groups.

### 4. Blog and Product Management

-   **View**: Can access this route if user have permission
-   **Create**: Can access this route if user have permission
-   **Update**: Can access this route if user have permission
-   **Delete**: Can access this route if user have permission

    (More info about these two modules: [Project Structure](#project-structure))

---

## Default Accounts

The app includes three default accounts for testing:

```
Admin:
    email: admin@test.com
    password: 123

Editor:
    email: editor@test.com
    password: 123

Viewer:
    email: viewer@test.com
    password: 123
```

---

## Project Structure

### `src`

-   **Routers**: Define application routes.
-   **Controllers**: Handle request logic.
-   **Services**: Contain business logic.

### `Modules`

1. **app**: Initializes the app, sets up all routes, and includes the default configuration files.
2. **auth**: Handles user authentication, including registration, login, and token refresh. It also manages `Role` and `PermissionGroup` routes.
3. **rbac**: Supports the **auth** module by managing authorization, ensuring users have the necessary permissions for their actions.
4. **role**: Provides functionality for creating and managing custom roles.
5. **blog** and **product**: Example modules used to test authorization and permission management.

### `libs`

-   Utilities for constants, enums, models, middlewares, and more.

---

## Security

This API uses **JWT** for authentication and RBAC enforcement. Each request requires a valid Bearer token. Unauthorized requests are denied, ensuring strict access control to sensitive resources.
