# Next Practical Steps for Back-End Development ("Avaliação Curso EAD")

This document outlines a sequence of actionable steps for a developer to begin building the back-end of the "Avaliação Curso EAD" platform, based on the previously established design and technology choices (Node.js/Express.js with PostgreSQL).

## 1. Setup Development Environment

*   **Install Core Software:**
    *   **Node.js & npm/Yarn:** Install the latest LTS version of Node.js (which includes npm). Optionally, install Yarn.
    *   **PostgreSQL:** Install the PostgreSQL database server.
    *   **Git:** Install Git for version control.
*   **Code Editor (e.g., VS Code):**
    *   Install and configure with relevant extensions: ESLint, Prettier, Node.js debugger, PostgreSQL client.
*   **API Testing Tool:**
    *   Install Postman or Insomnia for testing API endpoints.

## 2. Initialize Project & Core Dependencies

*   **Project Directory:** Create the main project folder (e.g., `avaliacao-curso-ead-backend`).
*   **Node.js Project Initialization:**
    *   `cd avaliacao-curso-ead-backend`
    *   `npm init -y` (or `yarn init -y`)
*   **Install Core Dependencies:**
    *   `npm install express pg bcrypt jsonwebtoken dotenv cors helmet morgan express-validator`
    *   (or `yarn add ...`)
    *   *Purpose: Web framework, PostgreSQL client, password hashing, JWTs, environment variables, CORS, security headers, request logging, input validation.*
*   **Install Dev Dependencies:**
    *   `npm install -D nodemon eslint prettier eslint-config-prettier eslint-plugin-prettier jest supertest`
    *   (or `yarn add -D ...`)
    *   *Purpose: Auto-restart server, linting, formatting, testing framework, HTTP assertion testing.*
*   **Configure Linting/Formatting:**
    *   Set up ESLint (e.g., `npx eslint --init`) and Prettier with their respective configuration files (`.eslintrc.js`, `.prettierrc.js`).
*   **`.gitignore`:** Create and configure (add `node_modules/`, `.env`, etc.).
*   **Project Structure:** Create the directories outlined in `project_structure.md` (`src`, `src/api`, `src/controllers`, etc.).

## 3. Database Setup

*   **Create Development Database:** Use a PostgreSQL client to create a database (e.g., `avaliacao_ead_dev`) and a dedicated user.
*   **Environment Configuration (`.env` file):**
    *   Create a `.env` file in the root.
    *   Add `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`, `JWT_SECRET`, `NODE_ENV=development`.
*   **Database Connection Module:** Create a module (e.g., `src/config/database.config.js`) to manage the PostgreSQL connection pool using the `pg` library.
*   **Apply Schema:**
    *   Manually run the SQL from `schema.sql` in your development database.
    *   *(Recommended for long-term)* Consider setting up a migration tool (e.g., Knex.js, node-pg-migrate) and creating an initial migration.

## 4. Implement First Feature: User Registration & Login

*   **Model (`src/models/user.model.js`):** Functions for `Users` table interactions (e.g., `createUser`, `findUserByEmail`).
*   **Service (`src/services/auth.service.js`):** Logic for registration (hash password, save user) and login (compare password, generate JWT).
*   **Controller (`src/controllers/auth.controller.js`):** Handles requests for registration and login, uses validation, calls services, sends responses.
*   **Routes (`src/api/auth.routes.js`):** Define routes and link to controller functions.
*   **App Setup (`src/app.js`, `src/server.js`):** Basic Express server, global middleware (`express.json()`, `cors`, etc.), mount auth routes.
*   **Manual Testing:** Use Postman/Insomnia to test endpoints.

## 5. Implement Core Middleware

*   **Authentication Middleware (`src/middleware/authenticateToken.js`):** Verify JWT from `Authorization` header.
*   **Error Handling Middleware (`src/middleware/errorHandler.js`):** Basic centralized error handler. Integrate in `app.js`.

## 6. Version Control with Git

*   `git init` in the project root.
*   Commit initial setup and first feature.
*   Commit frequently with descriptive messages.
*   Consider pushing to a remote repository (GitHub, GitLab).

## 7. Iteratively Build Remaining Endpoints

*   Follow `api_endpoints.md`. Implement one resource at a time (e.g., Universities, then Courses, then Reviews).
*   For each resource:
    *   Create model, service, controller, and route files.
    *   Implement CRUD operations.
    *   Apply input validation and authorization (admin roles for CUD on some resources).

## 8. Implement Core Logic Features

*   **Student Email Verification:**
    *   Generate/store verification tokens.
    *   Set up email sending (e.g., Nodemailer + Ethereal/SendGrid).
    *   Implement verification email and confirmation endpoint.
*   **Data Aggregation for Courses:**
    *   Implement logic to update average ratings in `Courses` when reviews change (in services or via DB triggers).

## 9. Testing Strategy

*   **Unit Tests (Jest):** For services, utility functions (mock dependencies).
*   **Integration Tests (Jest + Supertest):** For API endpoints (test HTTP requests/responses, DB state).
    *   Plan for a test database or cleanup strategy.

## 10. Security and Best Practices

*   Continuously apply security best practices (Helmet, input validation, parameterized queries/ORM).
*   Regularly update dependencies.

## 11. Documentation (README.md)

*   Update `README.md` with setup, run instructions, scripts, and basic API usage.

## 12. Review and Refactor

*   Periodically review code for clarity, performance, and security.
*   Refactor as needed.

This roadmap provides a structured path. Prioritize features, test incrementally, and commit regularly.
