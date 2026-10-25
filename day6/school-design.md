
# Day 6 Assignment: School Database Design

## 1. Table Explanations

### Students
The students table stores each student's details. It contains an ID, name, and email address. The ID is the primary key, while the email is required and must be unique so that two students cannot register with the same email.

### Courses
The courses table stores the courses offered by the school. It contains an ID and course name. The ID is the primary key, and the course name is required and unique.

### Enrolments
The enrolments table records which student is taking which course and the grade they receive. It contains its own primary key, student_id, course_id, and grade. The student_id and course_id are foreign keys that reference the students and courses tables. A UNIQUE constraint on student_id and course_id prevents a student from enrolling in the same course twice.

## 2. Relationships

The relationship between students and enrolments is one-to-many because one student can have several enrolment records, but each enrolment belongs to one student.

The relationship between courses and enrolments is also one-to-many because one course can have many students enrolled in it, but each enrolment refers to one course.

Students and courses therefore have a many-to-many relationship: a student can take multiple courses, and a course can have multiple students. The enrolments table acts as a join table connecting the two tables. It is necessary because it represents each student-course combination and stores additional information, such as the student's grade.

## 3. Index

I would add an index on enrolments(course_id). This would help the database find enrolments for a particular course more quickly, especially when listing students on a course or counting enrolments per course. The UNIQUE constraint on student_id and course_id already creates an index in SQLite that starts with student_id, but it is not as efficient for searches using course_id alone.

## 4. SQL or NoSQL?

I would choose SQL for this school system because the data is structured and has clear relationships between students, courses, and enrolments. A relational database supports primary keys, foreign keys, and UNIQUE constraints to protect data integrity and prevent invalid or duplicate enrolments. SQL also makes it straightforward to use JOIN and GROUP BY queries to retrieve courses, list students, and count enrolments. A NoSQL database can be useful for flexible or changing data structures, but a relational SQL database is a better fit for this system's structured data and relationships.
