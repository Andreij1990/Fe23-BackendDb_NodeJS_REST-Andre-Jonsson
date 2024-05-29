const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const engine = require('ejs-mate');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(express.static('public'));

const connection = require('./db');

app.get('/', (req, res) => {
  res.render('index', { title: 'Start Page' });
});

app.get('/students', (req, res) => {
  connection.query('SELECT * FROM students', (err, results) => {
    if (err) {
      console.error('An error occurred while fetching students');
      res.status(500).send('An error occurred');
      throw err;
    }
    res.render('students', { title: 'Students', students: results });
  });
});

app.put('/students/:id', (req, res) => {
  const { id } = req.params;
  const { fname, lname, town } = req.body;
  const query = 'UPDATE students SET fname = ?, lname = ?, town = ?, WHERE id = ?';
  connection.query(query, [fname, lname, town, id], (err) => {
    if (err) {
      console.error('An error occurred while updating the student');
      res.status(500).send('An error occurred');
      throw err;
    }
    res.send('Student updated successfully');
  });
});

app.delete('/students/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM students WHERE id = ?';
  connection.query(query, [id], (err) => {
    if (err) {
      console.error('An error occurred while deleting the student');
      res.status(500).send('An error occurred');
      throw err;
    }
    res.send('Student deleted successfully');
  });
});

app.post('/courses', (req, res) => {
  const { name, description } = req.body;
  const query = 'INSERT INTO courses (name, description) VALUES (?, ?)';
  connection.query(query, [name, description], (err, result) => {
    if (err) {
      console.error('An error occurred while adding a new course');
      res.status(500).send('An error occurred');
      throw err;
    }
    res.status(201).json({ id: result.insertId, name, description });
  });
});

app.get('/courses', (req, res) => {
  connection.query('SELECT * FROM courses', (err, results) => {
    if (err) {
      console.error('An error occurred while fetching courses');
      res.status(500).send('An error occurred');
      throw err;
    }
    res.render('courses', { title: 'Courses', courses: results });
  });
});

app.put('/courses/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const query = 'UPDATE courses SET name = ?, description = ? WHERE id = ?';
  connection.query(query, [name, description, id], (err) => {
    if (err) {
      console.error('An error occurred while updating the course');
      res.status(500).send('An error occurred');
      throw err;
    }
    res.send('Course updated successfully');
  });
});

app.delete('/courses/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM courses WHERE id = ?';
  connection.query(query, [id], (err) => {
    if (err) {
      console.error('An error occurred while deleting the course');
      res.status(500).send('An error occurred');
      throw err;
    }
    res.send('Course deleted successfully');
  });
});

app.post('/students_courses', (req, res) => {
  const { student_id, course_id } = req.body;
  const query = 'INSERT INTO students_courses (student_id, course_id) VALUES (?, ?)';
  connection.query(query, [student_id, course_id], (err, result) => {
    if (err) {
      console.error('An error occurred while adding a new student-course relationship');
      res.status(500).send('An error occurred');
      throw err;
    }
    res.status(201).json({ id: result.insertId, student_id, course_id });
  });
});

app.get('/students_courses', (req, res) => {
  connection.query('SELECT * FROM students_courses', (err, results) => {
    if (err) {
      console.error('An error occurred while fetching student-course relationships');
      res.status(500).send('An error occurred');
      throw err;
    }
    res.render('students_courses', { title: 'Student-Course Relationships', studentsCourses: results });
  });
});

app.put('/students_courses/:id', (req, res) => {
  const { id } = req.params;
  const { student_id, course_id } = req.body;
  const query = 'UPDATE students_courses SET student_id = ?, course_id = ? WHERE id = ?';
  connection.query(query, [student_id, course_id, id], (err) => {
    if (err) {
      console.error('An error occurred while updating the student-course relationship');
      res.status(500).send('An error occurred');
      throw err;
    }
    res.send('Student-course relationship updated successfully');
  });
});

app.delete('/students_courses/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM students_courses WHERE id = ?';
  connection.query(query, [id], (err) => {
    if (err) {
      console.error('An error occurred while deleting the student-course relationship');
      res.status(500).send('An error occurred');
      throw err;
    }
    res.send('Student-course relationship deleted successfully');
  });
});

app.get('/students/id/:id/courses', (req, res) => {
  let studentId = req.params.id;

  let studentNameSql = 'SELECT fName, lName FROM students WHERE id = ?';
  connection.query(studentNameSql, [studentId], (studentErr, studentResults) => {
    if (studentErr) {
      console.error('An error occurred while fetching student name');
      res.status(500).send('An error occurred');
      throw studentErr;
    }

    if (studentResults.length > 0) {
      let studentFirstName = studentResults[0].fName;
      let studentLastName = studentResults[0].lName;
      let studentFullName = `${studentFirstName} ${studentLastName}`;

      let sql = `
        SELECT courses.id, courses.name, courses.description
        FROM courses
        JOIN students_courses ON courses.id = students_courses.courses_id
        WHERE students_courses.students_id = ?
      `;
      connection.query(sql, [studentId], (err, results) => {
        if (err) {
          console.error('An error occurred while fetching student-course relationships');
          res.status(500).send('An error occurred');
          throw err;
        }
        
        res.render('studentCourses', { title: studentFullName, courses: results });
      });
    } else {
      res.status(404).send('Student not found');
    }
  });
});

app.get('/students/fName/:fName/courses', (req, res) => {
  let studentFirstName = req.params.fName;

  let studentNameSql = 'SELECT id, lName FROM students WHERE fName = ?';
  connection.query(studentNameSql, [studentFirstName], (studentErr, studentResults) => {
    if (studentErr) {
      console.error('An error occurred while fetching student name');
      res.status(500).send('An error occurred');
      throw studentErr;
    }

    if (studentResults.length > 0) {
      let studentId = studentResults[0].id;
      let studentLastName = studentResults[0].lName;
      let studentFullName = `${studentFirstName} ${studentLastName}`;

      let sql = `
        SELECT courses.id, courses.name, courses.description
        FROM courses
        JOIN students_courses ON courses.id = students_courses.courses_id
        WHERE students_courses.students_id = ?
      `;
      connection.query(sql, [studentId], (err, results) => {
        if (err) {
          console.error('An error occurred while fetching student-course relationships');
          res.status(500).send('An error occurred');
          throw err;
        }
        
        res.render('studentCourses', { title: studentFullName, courses: results });
      });
    } else {
      res.status(404).send('Student not found');
    }
  });
});

app.get('/students/lName/:lName/courses', (req, res) => {
  let studentLastName = req.params.lName;

  let studentNameSql = 'SELECT id, fName FROM students WHERE lName = ?';
  connection.query(studentNameSql, [studentLastName], (studentErr, studentResults) => {
    if (studentErr) {
      console.error('An error occurred while fetching student name');
      res.status(500).send('An error occurred');
      throw studentErr;
    }

    if (studentResults.length > 0) {
      let studentId = studentResults[0].id;
      let studentFirstName = studentResults[0].fName;
      let studentFullName = `${studentFirstName} ${studentLastName}`;

      let sql = `
        SELECT courses.id, courses.name, courses.description
        FROM courses
        JOIN students_courses ON courses.id = students_courses.courses_id
        WHERE students_courses.students_id = ?
      `;
      connection.query(sql, [studentId], (err, results) => {
        if (err) {
          console.error('An error occurred while fetching student-course relationships');
          res.status(500).send('An error occurred');
          throw err;
        }
        
        res.render('studentCourses', { title: studentFullName, courses: results });
      });
    } else {
      res.status(404).send('Student not found');
    }
  });
});

app.get('/students/town/:town/students', (req, res) => {
  let studentTown = req.params.town;

  let studentTownSql = 'SELECT id, fName, lName, town FROM students WHERE town = ?';
  connection.query(studentTownSql, [studentTown], (studentErr, studentResults) => {
    if (studentErr) {
      console.error('An error occurred while fetching students in town');
      res.status(500).send('An error occurred');
      throw studentErr;
    }

    if (studentResults.length > 0) {
      res.render('students', { title: studentTown, students: studentResults });
    } else {
      res.status(404).send('No students found in this town');
    }
  });
});

app.get('/courses/id/:id/students', (req, res) => {
  let courseId = req.params.id;
  let courseNameSql = 'SELECT name FROM courses WHERE id = ?';
  connection.query(courseNameSql, [courseId], (courseErr, courseResults) => {
    if (courseErr) {
      console.error('An error occurred while fetching course name');
      res.status(500).send('An error occurred');
      throw courseErr;
    }

    if (courseResults.length > 0) {
      let courseName = courseResults[0].name;

      let sql = `
        SELECT students.id, students.fName, students.lName, students.town
        FROM students
        JOIN students_courses ON students.id = students_courses.students_id
        WHERE students_courses.courses_id = ?
      `;
      connection.query(sql, [courseId], (err, results) => {
        if (err) {
          console.error('An error occurred while fetching student-course relationships');
          res.status(500).send('An error occurred');
          throw err;
        }
        
        res.render('coursesStudents', { title: courseName, students: results });
      });
    } else {
      res.status(404).send('Course not found');
    }
  });
});

app.get('/courses/name/:name/students', (req, res) => {
  let courseName = req.params.name;
  
  let courseIdSql = 'SELECT id FROM courses WHERE name = ?';
  connection.query(courseIdSql, [courseName], (courseErr, courseIdResults) => {
    if (courseErr) {
      console.error('Ett fel uppstod vid hämtning av kurs-ID från namn');
      res.status(500).send('Ett fel uppstod');
      throw courseErr;
    }

    if (courseIdResults.length > 0) {
      let courseId = courseIdResults[0].id;

      let sql = `
        SELECT students.id, students.fName, students.lName, students.town
        FROM students
        JOIN students_courses ON students.id = students_courses.students_id
        WHERE students_courses.courses_id = ?
      `;
      connection.query(sql, [courseId], (err, results) => {
        if (err) {
          console.error('Ett fel uppstod vid hämtning av student-kursrelationer');
          res.status(500).send('Ett fel uppstod');
          throw err;
        }
        
        res.render('coursesStudents', { title: courseName, students: results });
      });
    } else {
      res.status(404).send('Kursen hittades inte');
    }
  });
});

app.get('/courses/description/:word', (req, res) => {
  let word = req.params.word;
  let searchWord = `%${word}%`;

  let courseDescriptionSql = 'SELECT id, name, description FROM courses WHERE description LIKE ?';
  connection.query(courseDescriptionSql, [searchWord], (courseErr, courseResults) => {
    if (courseErr) {
      console.error('An error occurred while fetching courses with the word in description');
      res.status(500).send('An error occurred');
      throw courseErr;
    }

    if (courseResults.length > 0) {
      res.render('courses', { title: `Courses containing "${word}"`, courses: courseResults });
    } else {
      res.status(404).send('No courses found containing the specified word in the description');
    }
  });
});

app.get('/courses/name/:word', (req, res) => {
  let word = req.params.word;
  let searchWord = `%${word}%`;

  let courseNameSql = 'SELECT id, name, description FROM courses WHERE name LIKE ?';
  connection.query(courseNameSql, [searchWord], (courseErr, courseResults) => {
    if (courseErr) {
      console.error('An error occurred while fetching courses with the word in name');
      res.status(500).send('An error occurred');
      throw courseErr;
    }

    if (courseResults.length > 0) {
      res.render('courses', { title: `Courses containing "${word}"`, courses: courseResults });
    } else {
      res.status(404).send('No courses found containing the specified word in the name');
    }
  });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
