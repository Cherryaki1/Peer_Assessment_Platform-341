// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const csvParser = require('csv-parser');
const fs = require('fs');
const UserModel = require('./models/userModel');
const StudentModel = require('./models/studentModel');
const InstructorModel = require('./models/instructorModel');
const ClassModel = require('./models/classModel');

const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true 
}));

app.set('view engine', 'ejs');

// Passport Local Strategy

passport.use(new LocalStrategy({
    usernameField: 'ID', 
    passwordField: 'Password'
}, async (ID, Password, done) => {
    try {
        const user = await UserModel.findOne({ ID: ID }); // Look for ID
        if (!user) {
            return done(null, false, { message: 'No user with that email' });
        }

        // Compare passwords as plain text
        if (Password !== user.Password) {
            return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));


passport.serializeUser((user, done) => done(null, user.ID));
passport.deserializeUser(async (ID, done) => {
    try {
        const user = await UserModel.findOne({ID: ID});
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {}).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.render('login', { messages: req.flash() }); 
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid ID or password' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.json({ message: 'Login successful', user: user });
        });
    })(req, res, next);
});

app.get('/instructorManageClasses', async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }

        const instructorID = req.user.ID;
        
        if (!Number.isInteger(instructorID)) {
            return res.status(400).json({ message: 'Invalid instructor ID' });
        }

        // Use aggregation instead of populate
        const classes = await ClassModel.aggregate([
            { $match: { Instructor: instructorID } }, // Match classes by instructor
            {
                $lookup: {
                    from: 'students', // Collection name where students are stored (collection we wish to "link to")
                    localField: 'Students', // Field in the 'classes' collection (classes have their students' IDs, so in this case Students here are IDs)
                    foreignField: 'ID', // Field in the 'students' collection (ID field of the foreign collection, students)
                    as: 'StudentDetails' // Name of the array to output the joined data

                    /* so to lookup. we start from the current collection which is classes
                    * from: we set our target collection which is students (remember we are at classes rn)
                    * localField: the classes collection (current one) have the Students field which stores an array of Student IDs
                    * foreignField: this is the target field of our target collection (so its the ID field of the students collection)
                    * so we basically link the classes with the information of the student through their IDs
                    * Ask me questions if ur lost. its 3 am and I have a few braincells left lmao.
                    */
                }
            }
        ]);

        if (!classes || classes.length === 0) {
            return res.status(200).json({ classes: [], message: 'No classes found for this instructor.' });
        }

        // Format the response to include studentCount and groupCount
        const formattedClasses = classes.map(classItem => ({
            id: classItem.ID,
            name: classItem.Name,
            subject: classItem.Subject,
            section: classItem.Section,
            studentCount: classItem.StudentDetails.length,
            groupCount: Math.ceil(classItem.StudentDetails.length / 5) // Example calculation
        }));

        return res.status(200).json({ classes: formattedClasses });
    } catch (error) {
        console.error('Error fetching classes:', error.stack || error);
        return res.status(500).json({ message: 'An unexpected error occurred while fetching classes.', error: error.message || error });
    }
});

app.post('/uploadClass', upload.single('roster'), async (req, res) => {
    try {
        const { className, subject, section, instructorID, classID } = req.body;

        // Ensure all necessary data is provided
        if (!className || !subject || !section || !instructorID || !classID || !req.file) {
            return res.status(400).json({ message: 'Missing class details or CSV file.' });
        }

        // Parse the CSV file
        const students = [];
        fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (row) => {
                // Assuming CSV contains columns 'FirstName', 'LastName', 'ID', 'Email', 'Username', 'Department'
                if (row.ID && row.FirstName && row.LastName) {
                    students.push({
                        FirstName: row.FirstName.trim(),
                        LastName: row.LastName.trim(),
                        ID: parseInt(row.ID.trim()),
                        Email: row.Email.trim(),
                        Username: row.Username.trim(),
                        Department: row.Department.trim()
                    });
                }
            })
            .on('end', async () => {
                try {
                    // Check for existing students and insert new ones
                    const studentIDs = students.map(s => s.ID);
                    const existingStudents = await StudentModel.find({ ID: { $in: studentIDs } });

                    // Identify new students
                    const newStudents = students.filter(s => !existingStudents.some(es => es.ID === s.ID));

                    // Insert new students into the student collection
                    if (newStudents.length > 0) {
                        await StudentModel.insertMany(newStudents);
                    }

                    // Create the new class with the student IDs
                    const newClass = new ClassModel({
                        Name: className,
                        Subject: subject,
                        Section: section,
                        ID: classID,
                        Instructor: parseInt(instructorID),
                        Students: studentIDs // List of student IDs
                    });

                    await newClass.save();

                    // Clean up uploaded CSV file
                    fs.unlinkSync(req.file.path);

                    res.status(201).json({ message: 'Class created successfully', studentCount: studentIDs.length, groupCount: Math.ceil(studentIDs.length / 5) });
                } catch (error) {
                    console.error('Error saving class or students:', error);
                    res.status(500).json({ message: 'Error processing the CSV file' });
                }
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                return res.status(500).json({ message: 'Error reading the CSV file.' });
            });
    } catch (error) {
        console.error('Error uploading CSV:', error);
        res.status(500).json({ message: 'Failed to upload class roster' });
    }
});


app.get('/index', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user, message: '' });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});