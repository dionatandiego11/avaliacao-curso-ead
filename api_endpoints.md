# RESTful API Endpoints for "Avaliação Curso EAD"

## Authentication

1.  **User Registration**
    *   **HTTP Method:** `POST`
    *   **Path:** `/api/auth/register`
    *   **Brief Description:** Registers a new user (student).
    *   **Request Body:**
        ```json
        {
          "full_name": "string",
          "institutional_email": "string (email format)",
          "academic_registration": "string (optional)",
          "password": "string (min length 8)"
        }
        ```
    *   **Success Response (201 Created):**
        ```json
        {
          "user_id": 1,
          "full_name": "John Doe",
          "institutional_email": "john.doe@university.edu",
          "message": "User registered successfully. Please check your email to verify your account."
        }
        ```

2.  **User Login**
    *   **HTTP Method:** `POST`
    *   **Path:** `/api/auth/login`
    *   **Brief Description:** Logs in an existing user and returns a JWT.
    *   **Request Body:**
        ```json
        {
          "institutional_email": "string (email format)",
          "password": "string"
        }
        ```
    *   **Success Response (200 OK):**
        ```json
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "user": {
            "user_id": 1,
            "full_name": "John Doe",
            "institutional_email": "john.doe@university.edu"
          }
        }
        ```

3.  **Request Email Verification (Optional)**
    *   **HTTP Method:** `POST`
    *   **Path:** `/api/auth/request-verification`
    *   **Brief Description:** Allows an unverified user to request a new verification email.
    *   **Request Body:**
        ```json
        {
          "institutional_email": "string (email format)"
        }
        ```
    *   **Success Response (200 OK):**
        ```json
        {
          "message": "If your email is registered and unverified, a new verification link has been sent."
        }
        ```

4.  **Confirm Email Verification (Optional)**
    *   **HTTP Method:** `GET`
    *   **Path:** `/api/auth/verify-email`
    *   **Brief Description:** Confirms a user's email address using a token sent via email.
    *   **Query Parameters:**
        *   `token`: `string`
    *   **Success Response (200 OK):**
        ```json
        {
          "message": "Email verified successfully. You can now log in."
        }
        ```

---

## Universities

1.  **List All Universities**
    *   **HTTP Method:** `GET`
    *   **Path:** `/api/universities`
    *   **Brief Description:** Retrieves a list of all universities.
    *   **Query Parameters:**
        *   `page`: `integer`
        *   `limit`: `integer`
        *   `name`: `string` (partial match)
    *   **Success Response (200 OK):**
        ```json
        {
          "data": [
            {
              "university_id": 1,
              "name": "Universidade Federal de Minas Gerais",
              "abbreviation": "UFMG",
              "city_state": "Belo Horizonte, MG"
            }
          ],
          "pagination": { "total_items": 100, "total_pages": 10, "current_page": 1, "limit": 10 }
        }
        ```

2.  **Get University Details**
    *   **HTTP Method:** `GET`
    *   **Path:** `/api/universities/{university_id}`
    *   **Brief Description:** Retrieves details for a specific university.
    *   **Success Response (200 OK):**
        ```json
        {
          "university_id": 1,
          "name": "Universidade Federal de Minas Gerais",
          "abbreviation": "UFMG",
          "city_state": "Belo Horizonte, MG",
          "description": "Detailed description...",
          "created_at": "2023-01-15T10:00:00Z"
        }
        ```

3.  **Create University (Admin only)**
    *   **HTTP Method:** `POST`
    *   **Path:** `/api/universities`
    *   **Brief Description:** Creates a new university.
    *   **Request Body:**
        ```json
        {
          "name": "string",
          "abbreviation": "string (optional)",
          "city_state": "string (optional)",
          "description": "string (optional)"
        }
        ```
    *   **Success Response (201 Created):** (Returns the created university object)

4.  **Update University (Admin only)**
    *   **HTTP Method:** `PUT`
    *   **Path:** `/api/universities/{university_id}`
    *   **Brief Description:** Updates an existing university.
    *   **Request Body:** (Fields to update, all optional)
        ```json
        {
          "name": "string",
          "abbreviation": "string",
          "city_state": "string",
          "description": "string"
        }
        ```
    *   **Success Response (200 OK):** (Returns the updated university object)

5.  **Delete University (Admin only)**
    *   **HTTP Method:** `DELETE`
    *   **Path:** `/api/universities/{university_id}`
    *   **Brief Description:** Deletes a university.
    *   **Success Response (204 No Content):**

---

## Courses

1.  **List All Courses**
    *   **HTTP Method:** `GET`
    *   **Path:** `/api/courses`
    *   **Brief Description:** Retrieves courses with filtering, sorting, pagination.
    *   **Query Parameters:**
        *   `university_id`: `integer`
        *   `name`: `string` (partial match)
        *   `modality`: `string`
        *   `area_of_knowledge`: `string`
        *   `min_rating`: `float`
        *   `sort_by`: `string` (e.g., 'average_rating_desc', 'name_asc')
        *   `page`: `integer`
        *   `limit`: `integer`
    *   **Success Response (200 OK):**
        ```json
        {
          "data": [
            {
              "course_id": 101,
              "name": "Engenharia de Software EAD",
              "university_id": 1,
              "university_name": "Universidade Federal de Minas Gerais",
              "modality": "EAD_100%",
              "area_of_knowledge": "Engenharias",
              "average_overall_rating": 4.5,
              "total_reviews": 150
            }
          ],
          "pagination": { "total_items": 50, "total_pages": 5, "current_page": 1, "limit": 10 }
        }
        ```

2.  **Get Course Details**
    *   **HTTP Method:** `GET`
    *   **Path:** `/api/courses/{course_id}`
    *   **Brief Description:** Retrieves course details, aggregated ratings, and reviews.
    *   **Query Parameters (for reviews pagination):**
        *   `reviews_page`: `integer`
        *   `reviews_limit`: `integer`
    *   **Success Response (200 OK):**
        ```json
        {
          "course_id": 101,
          "name": "Engenharia de Software EAD",
          // ... other course fields
          "aggregated_ratings": {
            "average_overall_rating": 4.52,
            "total_reviews": 150,
            "recommendation_percentage": 92.5,
            "criteria_averages": { "content_quality": 4.6, /* ... */ }
          },
          "reviews": {
            "data": [ /* review objects */ ],
            "pagination": { /* pagination for reviews */ }
          }
        }
        ```

3.  **Create Course (Admin only)**
    *   **HTTP Method:** `POST`
    *   **Path:** `/api/courses`
    *   **Brief Description:** Creates a new course.
    *   **Request Body:**
        ```json
        {
          "name": "string",
          "university_id": "integer",
          "description": "string (optional)",
          "modality": "string (optional)",
          "area_of_knowledge": "string (optional)"
        }
        ```
    *   **Success Response (201 Created):** (Returns the created course object)

4.  **Update Course (Admin only)**
    *   **HTTP Method:** `PUT`
    *   **Path:** `/api/courses/{course_id}`
    *   **Brief Description:** Updates an existing course.
    *   **Request Body:** (Fields to update, all optional)
    *   **Success Response (200 OK):** (Returns the updated course object)

5.  **Delete Course (Admin only)**
    *   **HTTP Method:** `DELETE`
    *   **Path:** `/api/courses/{course_id}`
    *   **Brief Description:** Deletes a course.
    *   **Success Response (204 No Content):**

---

## Reviews

1.  **Submit New Review**
    *   **HTTP Method:** `POST`
    *   **Path:** `/api/courses/{course_id}/reviews`
    *   **Brief Description:** Submits a new review for a course. (Requires authentication)
    *   **Request Body:**
        ```json
        {
          "rating_content_quality": "integer (1-5)",
          "rating_faculty_expertise": "integer (1-5)",
          "rating_pedagogy": "integer (1-5)",
          "rating_learning_materials": "integer (1-5)",
          "rating_av_platform": "integer (1-5)",
          "rating_student_support": "integer (1-5)",
          "rating_infrastructure_virtual": "integer (1-5)",
          "rating_market_relevance": "integer (1-5)",
          "overall_rating": "integer (1-5)",
          "comment_positive": "string (optional)",
          "comment_negative": "string (optional)",
          "general_comment": "string (optional)",
          "recommends_course": "boolean"
        }
        ```
    *   **Success Response (201 Created):** (Returns the created review object)

2.  **List Reviews for a Course**
    *   **HTTP Method:** `GET`
    *   **Path:** `/api/courses/{course_id}/reviews`
    *   **Brief Description:** Lists reviews for a specific course. (Alternative/addition to Get Course Details)
    *   **Query Parameters:** `page`, `limit`, `sort_by`
    *   **Success Response (200 OK):** (Paginated list of review objects)

3.  **Get Reviews by Authenticated User (Optional)**
    *   **HTTP Method:** `GET`
    *   **Path:** `/api/me/reviews`
    *   **Brief Description:** Retrieves reviews by the authenticated user. (Requires authentication)
    *   **Query Parameters:** `page`, `limit`
    *   **Success Response (200 OK):** (Paginated list of review objects with course info)

4.  **Update Review (Admin/Moderator or User)**
    *   **HTTP Method:** `PUT`
    *   **Path:** `/api/reviews/{review_id}`
    *   **Brief Description:** Updates a review.
    *   **Request Body:** (Fields to update, all optional)
    *   **Success Response (200 OK):** (Returns the updated review object)

5.  **Delete Review (Admin/Moderator or User)**
    *   **HTTP Method:** `DELETE`
    *   **Path:** `/api/reviews/{review_id}`
    *   **Brief Description:** Deletes a review.
    *   **Success Response (204 No Content):**

---

## Search

1.  **General Search**
    *   **HTTP Method:** `GET`
    *   **Path:** `/api/search`
    *   **Brief Description:** Searches across courses, universities, etc.
    *   **Query Parameters:**
        *   `q`: `string` (query)
        *   `type`: `string` (optional: 'course', 'university')
        *   `page`: `integer`
        *   `limit`: `integer`
    *   **Success Response (200 OK):**
        ```json
        {
          "query": "Engenharia",
          "results": [
            { "type": "course", "data": { /* course summary */ } },
            { "type": "university", "data": { /* university summary */ } }
          ],
          "pagination": { /* ... */ }
        }
        ```

---

## Homepage Data

1.  **Get Recently Reviewed Courses**
    *   **HTTP Method:** `GET`
    *   **Path:** `/api/homepage/recently-reviewed`
    *   **Brief Description:** Gets courses with recent reviews.
    *   **Query Parameters:**
        *   `limit`: `integer` (e.g., 5)
    *   **Success Response (200 OK):**
        ```json
        {
          "data": [
            {
              "course_id": 101,
              "course_name": "Engenharia de Software EAD",
              "university_name": "Universidade Federal de Minas Gerais",
              "latest_review_snippet": "Ótimo curso...",
              "latest_review_rating": 5,
              "average_overall_rating": 4.5,
              "last_review_date": "2024-03-09T10:00:00Z"
            }
          ]
        }
        ```
