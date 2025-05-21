# Project Directory Structure for "Avaliação Curso EAD" Back-End

This document outlines a standard project directory structure for a Node.js/Express.js application, emphasizing separation of concerns, maintainability, and scalability.

```
/avaliacao-curso-ead-backend
├── .env                  # Environment variables (ignored by Git)
├── .eslintrc.js          # ESLint configuration
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies and scripts
├── README.md             # Project documentation
│
├── src/                  # Main application source code
│   ├── app.js            # Express application setup (middleware, routes)
│   ├── server.js         # HTTP server initialization (starts the server)
│   │
│   ├── api/              # API route definitions (can also be named 'routes')
│   │   ├── index.js      # Main router to combine all resource routers
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── universities.routes.js
│   │   ├── courses.routes.js
│   │   └── reviews.routes.js
│   │
│   ├── config/           # Configuration files/modules
│   │   ├── index.js      # Exports all configurations
│   │   ├── database.config.js
│   │   └── jwt.config.js
│   │
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── university.controller.js
│   │   ├── course.controller.js
│   │   └── review.controller.js
│   │
│   ├── services/         # Business logic layer
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── university.service.js
│   │   ├── course.service.js
│   │   ├── review.service.js
│   │   └── email.service.js
│   │
│   ├── models/           # Data access layer (database interaction)
│   │   ├── index.js      # Optional: DB connection setup / model exports
│   │   ├── user.model.js
│   │   ├── university.model.js
│   │   ├── course.model.js
│   │   └── review.model.js
│   │
│   ├── middleware/       # Custom Express middleware
│   │   ├── authenticateToken.js
│   │   ├── authorizeRole.js
│   │   ├── validateRequest.js
│   │   └── errorHandler.js
│   │
│   ├── utils/            # Utility functions and helpers
│   │   ├── AppError.js
│   │   ├── logger.js
│   │   └── passwordUtils.js
│
├── database/             # Database related files
│   ├── migrations/       # Database migration files
│   │   └── YYYYMMDDHHMMSS_create_initial_tables.js
│   ├── seeds/            # Optional: Database seed files
│   │   └── 01_add_sample_universities.js
│   └── schema.sql        # SQL schema definition file
│
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   │   ├── services/
│   │   │   └── auth.service.test.js
│   │   └── utils/
│   │       └── passwordUtils.test.js
│   ├── integration/      # Integration tests
│   │   └── api/
│   │       └── auth.routes.test.js
│   ├── e2e/              # End-to-end tests
│   │   └── app.e2e.test.js
│   └── setup.js          # Test setup file
│
└── public/               # Static files (e.g., API documentation)
    └── docs/

```

## Explanation:

*   **Root Level:**
    *   `.env`: Environment variables (DB credentials, JWT secrets). **Add to `.gitignore`**.
    *   `.eslintrc.js`: ESLint rules.
    *   `package.json`: Dependencies and scripts (`start`, `test`, `lint`, `migrate`).
    *   `README.md`: Project overview, setup, API usage.

*   **`src/` - Application Code:**
    *   `app.js`: Express app configuration (global middleware, main router, error handler).
    *   `server.js`: HTTP server setup and start.
    *   `api/` (or `routes/`): Defines API routes.
        *   `index.js`: Combines all resource-specific routers.
        *   `*.routes.js`: Routes for each resource (e.g., `users.routes.js`), mapping paths to controller functions.
    *   `config/`: Configuration management (DB, JWT, environment variables).
    *   `controllers/`: Request handlers; validate input, call services, send responses.
    *   `services/`: Core business logic; orchestrates operations, interacts with models.
    *   `models/`: Data access logic; database interactions (CRUD operations, DAOs, or ORM models).
    *   `middleware/`: Custom Express middleware (authentication, authorization, validation helpers, error handling).
    *   `utils/`: Reusable utility functions (custom error classes, loggers).

*   **`database/` - Database Management:**
    *   `migrations/`: Scripts for incremental database schema changes (e.g., for Knex, Sequelize).
    *   `seeds/`: Scripts to populate the database with initial/test data (optional).
    *   `schema.sql`: The complete SQL DDL for reference or initial setup.

*   **`tests/` - Automated Tests:**
    *   `unit/`: Tests for individual modules/functions in isolation.
    *   `integration/`: Tests interactions between components (e.g., controller-service-model).
    *   `e2e/`: End-to-end tests for full API flows.
    *   `setup.js`: Global test configuration (e.g., test DB setup).

*   **`public/` - Static Assets:**
    *   For serving static files. Minimal for pure APIs; could host API documentation.

This structure promotes modularity and separation of concerns, facilitating easier development, testing, and maintenance as the project grows.
