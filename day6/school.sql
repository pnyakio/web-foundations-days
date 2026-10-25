
-- Day 6 Assignment: School Database
-- Repository: web-foundations-days

-- 1. Create the students table
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- 2. Create the courses table
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE
);

-- 3. Create the enrolments table
CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE (student_id, course_id)
);

-- 4. Insert sample students
INSERT INTO students (name, email) VALUES
('Amina', 'amina@school.com'),
('Brian', 'brian@school.com'),
('Carol', 'carol@school.com'),
('David', 'david@school.com');

-- 5. Insert sample courses
INSERT INTO courses (course_name) VALUES
('Web Development'),
('Database Systems'),
('Computer Networks');

-- 6. Insert sample enrolments
INSERT INTO enrolments (student_id, course_id, grade) VALUES
(1, 1, 'A'),
(1, 2, 'B'),
(2, 1, 'A'),
(2, 3, 'A'),
(3, 2, 'A');

-- QUERY 1: All courses for one student (Amina)
SELECT students.name, courses.course_name, enrolments.grade
FROM students
JOIN enrolments ON enrolments.student_id = students.id
JOIN courses ON courses.id = enrolments.course_id
WHERE students.name = 'Amina';

-- QUERY 2: All students on one course (Web Development)
SELECT students.name, courses.course_name, enrolments.grade
FROM courses
JOIN enrolments ON enrolments.course_id = courses.id
JOIN students ON students.id = enrolments.student_id
WHERE courses.course_name = 'Web Development';

-- QUERY 3: Number of students per course
SELECT courses.course_name,
       COUNT(enrolments.student_id) AS number_of_students
FROM courses
LEFT JOIN enrolments ON enrolments.course_id = courses.id
GROUP BY courses.id, courses.course_name;

-- QUERY 4: Students who have no enrolments
SELECT students.id, students.name, students.email
FROM students
LEFT JOIN enrolments ON enrolments.student_id = students.id
WHERE enrolments.student_id IS NULL;

-- QUERY 5: Update Brian's Web Development grade to A
UPDATE enrolments
SET grade = 'A'
WHERE student_id = (
    SELECT id FROM students WHERE name = 'Brian'
)
AND course_id = (
    SELECT id FROM courses WHERE course_name = 'Web Development'
);
