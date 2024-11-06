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
const GroupModel = require('./models/groupModel');
const cors = require('cors');
require('dotenv').config();
const router = express.Router();


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

// Group Routes 
// Route to get all groups for a student
app.get('/student/groups', async (req, res) => {
    try {
        // Ensure the user is authenticated and is a student
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }

        const studentID = req.user.ID;  // The logged-in student's ID

        // Find all classes the student is enrolled in
        const classes = await ClassModel.find({ Students: studentID });

        if (classes.length === 0) {
            return res.status(404).json({ message: 'No classes found for this student.' });
        }

        // Get all class IDs for this student
        const classIDs = classes.map(classItem => classItem.ID);

        // Find all groups in the classes that the student is enrolled in
        const groups = await GroupModel.find({ ClassID: { $in: classIDs } });

        if (groups.length === 0) {
            return res.status(404).json({ message: 'No groups found for this student.' });
        }

        // Send the list of groups as a response
        res.status(200).json({ groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'An error occurred while fetching groups.' });
    }
});

app.get('/instructorManageClasses', async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }

        console.log("Inside Manage Classes");

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

                    // Update the 'Classes' field in the InstructorModel
                    await InstructorModel.updateOne(
                        { ID: instructorID },
                        { $addToSet: { Classes: classID } } // $addToSet ensures no duplicates
                    );

                    // Update the 'Classes' field for each student
                    await StudentModel.updateMany(
                        { ID: { $in: studentIDs } },
                        { $addToSet: { Classes: classID } }
                    );

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

// Route to create a new group
app.post('/createGroup', async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { newGroupName, classID, instructorID, newStudentIDs, newGroupID } = req.body;

        if (!newGroupName || !classID || !instructorID || !newStudentIDs || !newGroupID) {
            return res.status(400).json({ message: 'Missing group details.' });
        }

        const newGroup = new GroupModel({
            GroupName: newGroupName,
            Class: classID,
            Instructor: instructorID,
            Students: newStudentIDs,
            groupID: newGroupID
        });

        await newGroup.save();

        await ClassModel.updateOne(
            { ID: classID },
            { $addToSet: { Groups: newGroupID } } // $addToSet ensures no duplicates
        );

        console.log('Updating ClassModel for classID:', classID, 'with newGroupID:', newGroupID);
        console.log('Updating InstructorModel for instructorID:', instructorID, 'with newGroupID:', newGroupID);

        await InstructorModel.updateOne(
            { ID: instructorID },
            { $addToSet: { Groups: newGroupID } } // $addToSet ensures no duplicates
        );

        // Update the 'Groups' field for each student
        await StudentModel.updateMany(
            { ID: { $in: newStudentIDs } },
            { $addToSet: { Groups: newGroupID } }
        );

        res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Error creating group' });
    }
});

// Route to fetch all groups for a class
app.get('/groups/:classID', async (req, res) => {
    try {
        const groups = await GroupModel.find({ classID: req.params.classID });
        res.status(200).json({ groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Error fetching groups' });
    }
});


app.get('/instructorManageGroups/:classID', async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }
        
        const instructorID = req.user.ID;
        const { classID } = req.params; 
        console.log('Class ID:', classID);

        if (!Number.isInteger(instructorID)) {
            return res.status(400).json({ message: 'Invalid instructor ID' });
        }

        // 1. Fetch all groups for this class
        const groups = await GroupModel.aggregate([
            { $match: { Class : parseInt(classID) }}, // match group by classID
            {
                $lookup: {
                    from: 'students',  // collection with students
                    localField: 'Students',  // field in the groups collection
                    foreignField: 'ID',  // ID field in the students collection
                    as: 'StudentDetails'  // name of array that includes the joined student data
                }
            }
        ]);

        // 2. Get all student IDs from the groups
        const studentIDsInGroups = groups.flatMap(group => group.Students);

        // 3. Fetch all students in the class
        const classInfo = await ClassModel.findOne({ ID: parseInt(classID) });
        if (!classInfo) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const allStudentIDs = classInfo.Students;  // List of all students in the class

        // 4. Find students who are not in any group
        const ungroupedStudents = await StudentModel.find({
            ID: { $in: allStudentIDs, $nin: studentIDsInGroups }  // students in class but not in groups
        });

        // 5. Format groups to include group members
        const formattedGroups = groups.map(groupItem => ({
            id: groupItem.groupID,
            name: groupItem.GroupName, 
            groupMembers: groupItem.StudentDetails.map(student => ({
                id: student.ID, 
                name: `${student.FirstName} ${student.LastName}`
            }))
        }));
        
        // 6. Return both the groups and ungrouped students
        return res.status(200).json({
            groups: formattedGroups,
            ungroupedStudents: ungroupedStudents.map(student => ({
                id: student.ID,
                name: `${student.FirstName} ${student.LastName}`
            }))
        });

    } catch (error) {
        console.error('Error fetching groups and ungrouped students:', error.stack || error);
        return res.status(500).json({ message: 'An unexpected error occurred while fetching groups.', error: error.message || error });
    }
});

// Route to add students to an existing group
app.post('/addStudentsToGroup', async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { groupID, studentIDs } = req.body;

        if (!groupID || !studentIDs || studentIDs.length === 0) {
            return res.status(400).json({ message: 'Missing group ID or student IDs.' });
        }

        // Update the group to add the new student IDs
        await GroupModel.updateOne(
            { groupID: groupID },
            { $addToSet: { Students: { $each: studentIDs } } } // Add student IDs without duplicates
        );

        // update the students records to include this group
        await StudentModel.updateMany(
            { ID: { $in: studentIDs } },
            { $addToSet: { Groups: groupID } }
        );

        res.status(200).json({ message: 'Students added to group successfully.' });
    } catch (error) {
        console.error('Error adding students to group:', error);
        res.status(500).json({ message: 'Error adding students to group.' });
    }
});

// Route to remove students from an existing group
app.post('/removeStudentsFromGroup', async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { groupID, studentIDs } = req.body;

        if (!groupID || !studentIDs || studentIDs.length === 0) {
            return res.status(400).json({ message: 'Missing group ID or student IDs.' });
        }

        // Update the group to remove the specified student IDs
        await GroupModel.updateOne(
            { groupID: groupID },
            { $pull: { Students: { $in: studentIDs } } } // Remove student IDs
        );

        // update the students records to remove this group
        await StudentModel.updateMany(
            { ID: { $in: studentIDs } },
            { $pull: { Groups: groupID } }
        );

        res.status(200).json({ message: 'Students removed from group successfully.' });
    } catch (error) {
        console.error('Error removing students from group:', error);
        res.status(500).json({ message: 'Error removing students from group.' });
    }
});

app.get('/studentManageClasses', async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }

        console.log("Inside Manage Classes");

        const studentID = req.user.ID;
        
        if (!Number.isInteger(studentID)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        // Use aggregation instead of populate
        const classes = await ClassModel.aggregate([
            { $match: { Students: studentID } }, // Match classes by student and class ids
            {
                $lookup: {
                    from: 'students', // Collection name where students are stored (collection we wish to "link to")
                    localField: 'Students', // Field in the 'classes' collection (classes have their students' IDs, so in this case Students here are IDs)
                    foreignField: 'ID', // Field in the 'students' collection (ID field of the foreign collection, students)
                    as: 'StudentDetails' // Name of the array to output the joined data
                }
            }
        ]);

        if (!classes || classes.length === 0) {
            return res.status(200).json({ classes: [], message: 'No classes found for this student.' });
        }

        // Format the response to include studentCount and groupCount
        const formattedClasses = classes.map(classItem => ({
            id: classItem.ID,
            name: classItem.Name,
            subject: classItem.Subject,
            section: classItem.Section,
            studentCount: classItem.StudentDetails.length,
        }));

        return res.status(200).json({ classes: formattedClasses });
    } catch (error) {
        console.error('Error fetching classes:', error.stack || error);
        return res.status(500).json({ message: 'An unexpected error occurred while fetching classes.', error: error.message || error });
    }
});

app.get('/studentFromUser', async (req, res) => {
    console.log("User data in session:", req.user);

    const userID = Number(req.user?.ID);  // Ensure userID is a Number
    if (isNaN(userID)) {
        return res.status(400).json({ message: 'User ID is invalid or missing.' });
    }

    try {
        const student = await StudentModel.findOne({ ID: userID });
        console.log("Searching for student with userID:", userID);

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        res.json({ student });
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ message: 'Error fetching student data.' });
    }
});


app.get('/studentManageGroups/:classID', async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }
        
        const studentID = req.user.ID;
        const { classID } = req.params; 
        console.log('Class ID:', classID);

        if (!Number.isInteger(studentID)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        // 1. Fetch all groups for this class
        const groups = await GroupModel.aggregate([
            { $match: { Class : parseInt(classID) }}, // match group by classID
            {
                $lookup: {
                    from: 'students',  // collection with students
                    localField: 'Students',  // field in the groups collection
                    foreignField: 'ID',  // ID field in the students collection
                    as: 'StudentDetails'  // name of array that includes the joined student data
                }
            }
        ]);

        // 2. Get all student IDs from the groups
        const studentIDsInGroups = groups.flatMap(group => group.Students);

        // 3. Fetch all students in the class
        const classInfo = await ClassModel.findOne({ ID: parseInt(classID) });
        if (!classInfo) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const allStudentIDs = classInfo.Students;  // List of all students in the class

        // 4. Find students who are not in any group
        const ungroupedStudents = await StudentModel.find({
            ID: { $in: allStudentIDs, $nin: studentIDsInGroups }  // students in class but not in groups
        });

        // 5. Format groups to include group members
        const formattedGroups = groups.map(groupItem => ({
            id: groupItem.groupID,
            name: groupItem.GroupName, 
            groupMembers: groupItem.StudentDetails.map(student => ({
                id: student.ID, 
                name: `${student.FirstName} ${student.LastName}`
            }))
        }));
        
        // 6. Return both the groups and ungrouped students
        return res.status(200).json({
            groups: formattedGroups,
            ungroupedStudents: ungroupedStudents.map(student => ({
                id: student.ID,
                name: `${student.FirstName} ${student.LastName}`
            }))
        });

    } catch (error) {
        console.error('Error fetching groups and ungrouped students:', error.stack || error);
        return res.status(500).json({ message: 'An unexpected error occurred while fetching groups.', error: error.message || error });
    }
});

app.post('/ratingsSubmit', async (req, res) => {
    try {
        const { studentID, classID, dimensions } = req.body;
        
        const rating = {
            classID,
            dimensions: dimensions.map(dimension => ({
                dimensionName: dimension.dimensionName,
                groupRatings: dimension.groupRatings.map(groupRating => ({
                    raterID: groupRating.raterID,
                    ratingValue: groupRating.ratingValue,
                    comments: groupRating.comments
                }))
            }))
        };

        const student = await StudentModel.findOneAndUpdate(
            { ID: studentID },
            { $push: { Ratings: rating } },
            { new: true } // Return the updated document
        );

        if (student) {
            res.status(200).send('Rating saved successfully');
        } else {
            res.status(404).send('Student not found');
        }
    } catch (error) {
        res.status(500).send('Error saving rating: ' + error.message);
    }
});

app.get('/hasRated', async (req, res) => {
    const { userID, classID } = req.query; // Get userID and classID from query parameters

    if (!userID || !classID) {
        return res.status(400).json({ message: 'User ID and Class ID are required.' });
    }

    try {
        // Find students whose ratings include a group rating by this raterID
        const students = await StudentModel.find({
            'Ratings.classID': classID,
            'Ratings.dimensions.groupRatings.raterID': userID
        });

        // Extract the unique IDs of students rated by this rater
        const ratedStudentIDs = students
        .map(student => student.ID)
        .filter((value, index, self) => self.indexOf(value) === index);  // Ensure uniqueness

        console.log("Rated Student IDs for class:", classID, ratedStudentIDs); // Debugging line
        res.json({ [classID]: ratedStudentIDs }); // Return the result with classID as key
    } catch (error) {
        console.error('Error fetching rated students:', error);
        res.status(500).json({ message: 'Error fetching rated students.' });
    }
});

// Route to fetch student summaries for a class
router.get('/studentsSummary/:classID', async (req, res) => {
    try {
        // 1. Authentication Check
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }

        const instructorID = req.user.ID;
        const { classID } = req.params;

        // 2. Validate classID
        if (!classID) {
            return res.status(400).json({ message: 'Class ID is required.' });
        }

        // Optionally validate instructorID if needed
        // For example, check if the instructor is associated with the class
        const classInfo = await ClassModel.findOne({ ID: parseInt(classID) });

        if (!classInfo) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        // Optional: Verify instructor's association with the class
        // Assuming ClassModel has an 'InstructorID' field
        if (classInfo.InstructorID !== parseInt(instructorID)) {
            return res.status(403).json({ message: 'Forbidden: You are not the instructor for this class.' });
        }

        // 3. Fetch all groups for the class with student details
        const groups = await GroupModel.aggregate([
            { $match: { ClassID: parseInt(classID) } }, // Match groups by classID
            {
                $lookup: {
                    from: 'students', // Collection name in MongoDB is usually lowercase and plural
                    localField: 'Students', // Array of student IDs in GroupModel
                    foreignField: 'ID', // Field in StudentModel to match
                    as: 'StudentDetails'
                }
            }
        ]);

        // 4. Extract student IDs from groups
        const studentIDsInGroups = groups.flatMap(group => group.Students.map(id => parseInt(id)));

        // 5. Fetch all students in the class
        const allStudentIDs = classInfo.Students.map(id => parseInt(id)); // Assuming 'Students' is an array of student IDs

        // 6. Find students who are not in any group
        const ungroupedStudents = await StudentModel.find({
            ID: { $in: allStudentIDs, $nin: studentIDsInGroups }
        });

        // 7. Fetch ratings for all students in the class
        const ratings = await RatingModel.find({
            StudentID: { $in: allStudentIDs }
        });

        // 8. Organize ratings by StudentID
        const ratingsByStudent = ratings.reduce((acc, rating) => {
            if (!acc[rating.StudentID]) {
                acc[rating.StudentID] = [];
            }
            acc[rating.StudentID].push(rating);
            return acc;
        }, {});

        // 9. Format groups to include group members and their ratings
        const formattedGroups = groups.map(groupItem => ({
            id: groupItem.ID, // Assuming GroupModel has 'ID' field
            name: groupItem.GroupName, // Assuming GroupModel has 'GroupName' field
            groupMembers: groupItem.StudentDetails.map(student => ({
                id: student.ID,
                name: `${student.FirstName} ${student.LastName}`,
                ratings: ratingsByStudent[student.ID] || []
            }))
        }));

        // 10. Format ungrouped students with their ratings
        const formattedUngroupedStudents = ungroupedStudents.map(student => ({
            id: student.ID,
            name: `${student.FirstName} ${student.LastName}`,
            ratings: ratingsByStudent[student.ID] || []
        }));

        // 11. Combine groups and ungrouped students into the summary
        const studentSummary = [];

        // Add grouped students to the summary
        formattedGroups.forEach(group => {
            group.groupMembers.forEach(member => {
                studentSummary.push({
                    StudentID: member.id,
                    FirstName: member.name.split(' ')[0],
                    LastName: member.name.split(' ')[1],
                    Team: group.name,
                    // Assuming ratings have 'dimensionName' and 'groupRatings' fields
                    ...extractRatings(member.ratings),
                    PeersWhoResponded: member.ratings.length
                });
            });
        });

        // Add ungrouped students to the summary
        formattedUngroupedStudents.forEach(student => {
            studentSummary.push({
                StudentID: student.id,
                FirstName: student.name.split(' ')[0],
                LastName: student.name.split(' ')[1],
                Team: 'No team assigned',
                ...extractRatings(student.ratings),
                PeersWhoResponded: student.ratings.length
            });
        });

        // 12. Return the student summary
        return res.status(200).json({ studentSummary });

    } catch (error) {
        console.error('Error fetching student summary:', error.stack || error);
        return res.status(500).json({ message: 'An unexpected error occurred while fetching student summary.', error: error.message || error });
    }
});

// Helper function to extract ratings by dimension
const extractRatings = (ratings) => {
    const ratingMap = {
        Cooperation: 'N/A',
        'Conceptual Contribution': 'N/A',
        'Practical Contribution': 'N/A',
        'Work Ethic': 'N/A'
    };

    ratings.forEach(rating => {
        if (rating.dimensionName in ratingMap) {
            ratingMap[rating.dimensionName] = rating.groupRatings;
        }
    });

    return {
        Cooperation: ratingMap.Cooperation,
        ConceptualContribution: ratingMap['Conceptual Contribution'],
        PracticalContribution: ratingMap['Practical Contribution'],
        WorkEthic: ratingMap['Work Ethic']
    };
};


app.get('/index', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user, message: '' });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        // Send a success message and redirect to login page
        res.json({ message: 'Logout successful' });
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

module.exports = app;