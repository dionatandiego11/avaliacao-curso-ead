# Core Back-End Logic Outline for "Avaliação Curso EAD"

This document outlines the core back-end logic required for the platform, assuming a Node.js/Express framework with PostgreSQL as the database.

## 1. User Input Validation

*   **Location:** Primarily in Express middleware, executed before controller logic.
*   **Tools:** Libraries like `express-validator` or `Joi`. `express-validator` integrates well as middleware.
*   **Process:** Define validation schemas/rules for each endpoint accepting input (request body, query parameters, path parameters).
*   **Key Examples:**
    *   **User Registration (`POST /api/auth/register`):**
        *   `full_name`: Non-empty string.
        *   `institutional_email`: Valid email format, unique in `Users` table.
        *   `password`: Min length (e.g., 8), complexity (e.g., uppercase, lowercase, number, special character).
    *   **Review Submission (`POST /api/courses/{course_id}/reviews`):**
        *   `rating_*` fields: Integer, between 1-5.
        *   `overall_rating`: Integer, between 1-5.
        *   `comment_*`: Optional string, max length.
        *   `recommends_course`: Boolean.
    *   **Query Parameters (e.g., `GET /api/courses`):**
        *   `page`, `limit`: Positive integers.
        *   `min_rating`: Float/number between 1.0-5.0.
*   **Error Handling:** Validation middleware should return a `400 Bad Request` response with detailed error messages if validation fails.

## 2. Password Management

*   **Salting and Hashing:**
    *   Use `bcrypt` library.
    *   Generate a salt and hash the password upon user registration. Store only the hash in `Users.password_hash`.
    *   `const saltRounds = 10;` (cost factor).
*   **Comparing Passwords:**
    *   During login, retrieve the stored `password_hash`.
    *   Use `bcrypt.compare(plainPasswordFromLogin, hashedPasswordFromDB)` to verify.

## 3. Authentication and Authorization

*   **JWT Generation:**
    *   Upon successful login, generate a JWT using `jsonwebtoken`.
    *   **Payload:** `userId`, `role` (e.g., 'student', 'admin'), `exp` (expiration time).
    *   Sign with a strong secret key (from environment variables).
*   **JWT Verification Middleware:**
    *   Extract JWT from `Authorization: Bearer <token>` header.
    *   Verify using `jsonwebtoken.verify()`.
    *   If valid, attach decoded payload (e.g., `req.user`) to the request object.
    *   If invalid/expired, return `401 Unauthorized` or `403 Forbidden`.
*   **Role-Based Access Control (RBAC):**
    *   Middleware checks `req.user.role`.
    *   If the role is not authorized for the endpoint (e.g., non-admin accessing an admin route), return `403 Forbidden`.
    *   Example: `router.post('/admin/data', authenticateToken, authorizeRole('admin'), adminController.manageData);`

## 4. Student Verification Logic (Conceptual)

1.  **Token Generation:** On registration, create a unique, time-limited verification token (e.g., UUID) and store it with an expiry in the `Users` table (e.g., `email_verification_token`, `email_verification_token_expires_at`).
2.  **Email Sending:** Use a service like `Nodemailer` to send an email containing a verification link (e.g., `/api/auth/verify-email?token=<token>`).
3.  **Verification Endpoint (`GET /api/auth/verify-email`):**
    *   Extract token from query.
    *   Validate token (exists, not expired, matches user).
    *   If valid: update `Users.is_verified = TRUE`, clear/invalidate the token.
    *   If invalid: return an error.

## 5. Data Aggregation for Courses

*   **Calculations Needed:**
    *   Average ratings (overall and per criterion): `AVG(rating_field) GROUP BY course_id`.
    *   Total reviews: `COUNT(review_id) GROUP BY course_id`.
    *   Recommendation percentage: `(COUNT(CASE WHEN recommends_course = TRUE THEN 1 END) * 100.0) / COUNT(review_id) GROUP BY course_id`.
*   **Implementation Approaches:**
    1.  **On-the-Fly Calculation (SQL Queries):**
        *   **Pros:** Always up-to-date, no data redundancy.
        *   **Cons:** Can be performance-heavy for reads, especially with many reviews or frequent listing.
    2.  **Stored Denormalized Fields on `Courses` Table:**
        *   (e.g., `average_overall_rating`, `total_reviews` columns in `Courses`).
        *   **Pros:** Faster reads, simpler list queries.
        *   **Cons:** Data redundancy, requires updates on review CUD (Create/Update/Delete).
        *   **Update Mechanisms:**
            *   **Application Logic:** After review CUD, application recalculates and updates `Courses`.
            *   **Database Triggers:** (e.g., `AFTER INSERT OR UPDATE OR DELETE ON Reviews`) automatically update `Courses`. More robust for consistency.
    *   **Recommendation:** For better read performance, **denormalized fields updated by database triggers or careful application logic** is generally preferred for frequently accessed aggregated data.

## 6. Filtering and Pagination Logic

*   **Dynamic Filtering:**
    *   Service/repository layer dynamically builds SQL `WHERE` clauses based on API query parameters (`university_id`, `area_of_knowledge`, `min_rating`, etc.).
    *   Use parameterized queries to prevent SQL injection.
    *   Example: `conditions.push(`c.area_of_knowledge ILIKE $${paramIndex++}`); values.push(`%${queryParams.area_of_knowledge}%`);`
*   **Pagination:**
    *   Use `LIMIT` and `OFFSET` in SQL.
    *   `page` and `limit` from query params (e.g., `page=1`, `limit=10`).
    *   `offset = (page - 1) * limit;`.
    *   Execute a separate `COUNT(*)` query with the same filters to get `total_items` for pagination metadata.
    *   Return pagination info: `total_items`, `total_pages`, `current_page`, `limit`.

## 7. Error Handling

*   **Consistent Error Response Format:**
    ```json
    {
      "error": {
        "status": "integer (HTTP status code)",
        "message": "string",
        "details": "object/array (optional, e.g., for validation errors)"
      }
    }
    ```
*   **Centralized Error Handling Middleware:**
    *   Express middleware defined last (`err, req, res, next`).
    *   Catches errors from `next(err)`.
    *   Logs errors (especially 5xx).
    *   Sends standardized JSON error response.
    *   Differentiates between operational errors (expected, user-facing messages) and programming errors (generic message in production).
    *   Custom `AppError` class can be helpful: `class AppError extends Error { constructor(message, statusCode) { ... } }`.

## 8. Asynchronous Operations

*   **Promises and `async/await`:**
    *   Use `async/await` for all asynchronous operations (database queries, external API calls, file I/O) to maintain readability and avoid callback hell.
    *   Ensure functions performing async work are `async` and calls are `await`ed.
    *   Database library functions (e.g., from `pg`) return Promises.
    *   Use `try...catch` blocks for error handling in `async` functions, or `.catch()` for plain Promises.
    *   Pass caught errors to the centralized error handler via `next(error)`.

This outline provides a blueprint for developing the back-end logic. Each section will require detailed implementation and testing.
