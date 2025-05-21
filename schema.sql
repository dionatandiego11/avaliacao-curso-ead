CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    institutional_email VARCHAR(255) UNIQUE NOT NULL,
    academic_registration VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Universities (
    university_id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    abbreviation VARCHAR(50) UNIQUE,
    city_state VARCHAR(150),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Courses (
    course_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    university_id INT NOT NULL,
    description TEXT,
    modality VARCHAR(100),
    area_of_knowledge VARCHAR(100),
    -- average_rating DECIMAL(3, 2) DEFAULT 0.00, -- To be calculated or updated via triggers/app logic.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES Universities(university_id) ON DELETE CASCADE
);

CREATE INDEX idx_courses_university_id ON Courses(university_id);
CREATE INDEX idx_courses_name ON Courses(name);
-- Consider also an index on (name, university_id) if you often search for courses by name within a specific university.
-- CREATE UNIQUE INDEX idx_courses_name_university_id ON Courses(name, university_id); -- If course names must be unique *within* a university

CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    rating_content_quality SMALLINT CHECK (rating_content_quality >= 1 AND rating_content_quality <= 5),
    rating_faculty_expertise SMALLINT CHECK (rating_faculty_expertise >= 1 AND rating_faculty_expertise <= 5),
    rating_pedagogy SMALLINT CHECK (rating_pedagogy >= 1 AND rating_pedagogy <= 5),
    rating_learning_materials SMALLINT CHECK (rating_learning_materials >= 1 AND rating_learning_materials <= 5),
    rating_av_platform SMALLINT CHECK (rating_av_platform >= 1 AND rating_av_platform <= 5),
    rating_student_support SMALLINT CHECK (rating_student_support >= 1 AND rating_student_support <= 5),
    rating_infrastructure_virtual SMALLINT CHECK (rating_infrastructure_virtual >= 1 AND rating_infrastructure_virtual <= 5),
    rating_market_relevance SMALLINT CHECK (rating_market_relevance >= 1 AND rating_market_relevance <= 5),
    overall_rating SMALLINT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    comment_positive TEXT,
    comment_negative TEXT,
    general_comment TEXT, -- If this is used, positive/negative might be optional or deprecated.
    recommends_course BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    UNIQUE (user_id, course_id)
);

CREATE INDEX idx_reviews_course_id ON Reviews(course_id);
CREATE INDEX idx_reviews_user_id ON Reviews(user_id);

-- Optional: ENUM types for fields with fixed sets of values (PostgreSQL specific)
-- This can improve data integrity and potentially storage/performance.
-- Example for Modality:
-- CREATE TYPE course_modality_enum AS ENUM ('EAD_100%', 'SEMIPRESENCIAL', 'PRESENCIAL_CONECTADO');
-- Then, in Courses table:
-- modality course_modality_enum,

-- Example for Area of Knowledge (this list would need to be comprehensive):
-- CREATE TYPE area_knowledge_enum AS ENUM ('Ciências Exatas e da Terra', 'Ciências Biológicas', 'Engenharias', 'Ciências da Saúde', 'Ciências Agrárias', 'Ciências Sociais Aplicadas', 'Ciências Humanas', 'Linguística, Letras e Artes', 'Outros');
-- Then, in Courses table:
-- area_of_knowledge area_knowledge_enum,

-- Note on average_rating in Courses table:
-- If you decide to store average_rating in the Courses table,
-- you'll need a mechanism to update it whenever a new review is added, an existing one is updated, or one is deleted.
-- This can be done using database triggers or application-level logic.
-- For example, a trigger on the Reviews table could recalculate and update Courses.average_rating.
-- Calculating it on-the-fly might be simpler for smaller datasets but less performant for large ones.
-- Example of how to calculate it on the fly:
-- SELECT course_id, AVG(overall_rating) FROM Reviews GROUP BY course_id;
-- To get for a specific course:
-- SELECT AVG(overall_rating) FROM Reviews WHERE course_id = [specific_course_id];
```
