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

// Main Route
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


/*
*
* ===== INSTRUCTOR ROUTES =====
*
*/

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
            groupCount: Math.ceil(classItem.StudentDetails.length / 5), // Example calculation
            submissionDeadline: classItem.submissionDeadline // Include deadline

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

app.get('/getInstructorGrades', async (req, res) => {
    const { userID } = req.query;

    if (!userID) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        // Find the instructor by user ID
        const instructor = await InstructorModel.findOne({ ID: parseInt(userID) });

        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found.' });
        }

        const classRatingsMap = {};

        // Process each rating in the Ratings array
        instructor.Ratings.forEach((rating) => {
            const { classID, dimensions } = rating;

            if (!classRatingsMap[classID]) {
                classRatingsMap[classID] = {};
            }

            // Process dimensions for the current rating
            dimensions.forEach((dimension) => {
                const { dimensionName, classRatings } = dimension;

                if (!classRatingsMap[classID][dimensionName]) {
                    classRatingsMap[classID][dimensionName] = {
                        totalRatings: 0,
                        totalValue: 0,
                        comments: [],
                    };
                }

                // Process the classRating object (even if it's an array with one object)
                classRatings.forEach((classRating) => {
                    classRatingsMap[classID][dimensionName].totalRatings += 1;
                    classRatingsMap[classID][dimensionName].totalValue += classRating.ratingValue;

                    if (classRating.comments && classRating.comments.trim().length > 0) {
                        classRatingsMap[classID][dimensionName].comments.push(classRating.comments);
                    }
                });
            });
        });

        // Format the response
        const ratingsByClass = Object.keys(classRatingsMap).map((classID) => {
            const dimensions = Object.keys(classRatingsMap[classID]).map((dimensionName) => {
                const data = classRatingsMap[classID][dimensionName];
                return {
                    dimensionName,
                    averageRating: (data.totalValue / data.totalRatings).toFixed(2), // Calculate average
                    comments: data.comments, // Collect comments
                };
            });

            return {
                classID,
                dimensions,
            };
        });

        res.json(ratingsByClass);
    } catch (error) {
        console.error('Error fetching instructor ratings:', error);
        res.status(500).json({ message: 'Error fetching instructor ratings.' });
    }
});



// Route to fetch all students in a specified classID along with their details
app.get('/studentsSummary/:classID', async (req, res) => {
    try {
        const { classID } = req.params; // Get classID from the URL
        const parsedClassID = parseInt(classID, 10);
        console.log('classID parameter:', parsedClassID);

        // Log incoming request and authentication status
        console.log('Received request to /studentsSummary/:', parsedClassID);
        console.log('Authentication status:', req.isAuthenticated());

        // Ensure user is authenticated
        if (!req.isAuthenticated() || !req.user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }
        
        // Validate parsedClassID is a number and log result
        if (isNaN(parsedClassID)) {
            console.log('Invalid classID format:', classID);
            return res.status(400).json({ message: 'Invalid class ID.' });
        }
        console.log('Parsed classID:', parsedClassID);

        // Log database query to find students
        console.log('Querying database for students with classID:', parsedClassID);
        
        // Fetch students with populated group details (including GroupName)
        const students = await StudentModel.find(
            { Classes: parsedClassID }, // Find students with the classID in the Classes field
            {
                FirstName: 1,
                LastName: 1,
                ID: 1,
                Email: 1,
                Username: 1,
                Department: 1,
                Classes: 1,
                Groups: 1,
                Ratings: 1
            })
        console.log('Student ' + students);
        const groupIDs = students.flatMap(student => student.Groups);
        const groups = await GroupModel.find({
            Class: { $in: classID},
            groupID: { $in: groupIDs}
        })

        const groupMap = Object.fromEntries(groups.map(group => [group.groupID, group.GroupName]));
        console.log(`Group List ${groupMap}`);
         // Log the result of the query
        if (!students || students.length === 0) {
            console.log('No students found for classID:', parsedClassID);
            return res.status(404).json({ message: 'No students found for this class.' });
        }
        console.log(`Found ${students.length} students for classID ${parsedClassID}`);

        // Send the students data in the response along with their group details
        return res.status(200).json({ studentSummary: students , groupDetails: groupMap});

    } catch (error) {
        // Log any errors encountered during execution
        console.error('Error fetching student summary:', error);
        return res.status(500).json({
            message: 'An unexpected error occurred while fetching student summary.',
            error: error.message
        });
    }
});



/*
*
* ===== STUDENT ROUTES =====
*
*/


app.get('/studentManageClasses', async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }

        const studentID = req.user.ID;

        if (!Number.isInteger(studentID)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        const classes = await ClassModel.aggregate([
            { 
                $match: { Students: studentID } // Match classes where the student is enrolled 
            },
            {
                $lookup: { // First lookup: join students to each class
                    from: 'students',
                    localField: 'Students', // Array of student IDs in ClassModel
                    foreignField: 'ID', // Match on student IDs in students collection
                    as: 'StudentDetails' // Output student details array
                }
            },
            {
                $lookup: { // Second lookup: join instructors to each class using instructor ID
                    from: 'instructors',
                    localField: 'Instructor', // Field in ClassModel that holds the instructor ID
                    foreignField: 'ID', // Instructor ID field in instructors collection
                    as: 'InstructorDetails' // Output instructor details array
                }
            },
            {
                $unwind: { 
                    path: '$InstructorDetails', 
                    preserveNullAndEmptyArrays: true // Ensure no errors if no instructor found
                }
            },
            {
                $project: { // Project fields needed for the response
                    ID: 1,
                    Name: 1,
                    Subject: 1,
                    Section: 1,
                    StudentDetails: 1,
                    Instructor: 1,
                    instructorName: { // Concatenate FirstName and LastName for full name
                        $concat: ["$InstructorDetails.FirstName", " ", "$InstructorDetails.LastName"]
                    }
                }
            }
        ]);

        console.log('Classes after aggregation:', classes); // Log to check data structure

        if (!classes || classes.length === 0) {
            return res.status(200).json({ classes: [], message: 'No classes found for this student.' });
        }

        // Format the response to include student count and instructor details
        const formattedClasses = classes.map(classItem => ({
            id: classItem.ID,
            name: classItem.Name,
            subject: classItem.Subject,
            section: classItem.Section,
            studentCount: classItem.StudentDetails.length,
            instructorID: classItem.Instructor,
            instructorName: classItem.instructorName ? classItem.instructorName : 'N/A'
        }));

        console.log('Formatted classes:', formattedClasses);

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

        if (!groups || groups.length === 0) {
            console.log('No groups found for class:', classID);
            return res.status(404).json({ message: 'Class not found or no groups available.' });
        }

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

app.post('/studentRatingsSubmit', async (req, res) => {
    try {
        const { studentID, classID, dimensions } = req.body;

        // Calculate RiceGrains
        let totalRiceGrains = 0;
        let isPerfectRating = true;

        dimensions.forEach(dimension => {
            dimension.groupRatings.forEach(groupRating => {
                totalRiceGrains += groupRating.ratingValue * 10; // 10 grains for each star

                // Check if the rating is perfect (5 stars); if not, mark isPerfectRating as false
                if (groupRating.ratingValue !== 5) {
                    isPerfectRating = false;
                }
            });
        });

        // Add a bonus of 50 grains if all dimensions have a perfect rating
        if (isPerfectRating) {
            totalRiceGrains += 50;
        }

        // Create the rating object to store in the database
        const rating = {
            classID,
            dimensions: dimensions.map(dimension => ({
                dimensionName: dimension.dimensionName,
                groupRatings: dimension.groupRatings.map(groupRating => ({
                    raterID: groupRating.raterID,
                    ratingValue: groupRating.ratingValue,
                    comments: groupRating.comments
                }))
            })),
            riceGrainsAwarded: totalRiceGrains // Add rice grains to the rating
        };

        // Update the student document with the new rating and add the rice grains
        const student = await StudentModel.findOneAndUpdate(
            { ID: studentID },
            { 
                $push: { Ratings: rating },
                $inc: { RiceGrains: totalRiceGrains } // Increment RiceGrains by the calculated amount
            },
            { new: true } // Return the updated document
        );

        if (student) {
            res.status(200).json({
                message: 'Rating saved successfully',
                riceGrainsAwarded: totalRiceGrains, // Send RiceGrains in the response as well
                totalRiceGrains: student.RiceGrains // Send updated total rice grains
            });
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


app.get('/getUserGrades', async (req, res) => {
    const { userID } = req.query;

    if (!userID) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    try {
        // Find the user to get their groups and classes
        const user = await StudentModel.findOne({ ID: userID });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Get groups the user belongs to
        const userGroupID = user.Groups;
        
        const userGroups = await GroupModel.find({ groupID: { $in: userGroupID } });
        // Initialize response structure
        const gradesByClass = {};
        const ratingStudents = [];

        for (const group of userGroups) {
            const classID = group.Class;
            const groupID = group.groupID;
            const groupName = group.GroupName;
            console.log('In loop');
            // Fetch all students in the group along wiIth their ratings
            const studentIDs = group.Students;
            const groupMembers = await StudentModel.find({
                ID: { $in: studentIDs }  // Query to find all students with the given studentIDs
            });

            if (!gradesByClass[classID]) {
                gradesByClass[classID] = [];
            }

            // Loop through the user's ratings
            user.Ratings.forEach(rating => {
                // Check if the rating corresponds to the relevant class
                if (rating.classID === classID) {
                    // Loop through each dimension in the rating
                    rating.dimensions.forEach(dimension => {
                        // For each group rating, extract the raterID
                        dimension.groupRatings.forEach(groupRating => {
                            const raterID = groupRating.raterID;
                            // Check if the raterID exists in the groupMembers
                            const raterInGroup = groupMembers.find(member => member.ID === raterID);

                            // If the raterID exists in the group, we need to add or update the `raterStudents`
                            if (raterInGroup) {
                                // Find or create the `group` entry in `gradesByClass`
                                let groupEntry = gradesByClass[classID].find(g => g.groupID === groupID);

                                if (!groupEntry) {
                                    // Create new entry if groupID does not exist yet in `gradesByClass[classID]`
                                    groupEntry = {
                                        groupID,
                                        groupName: groupName || "Unnamed Group",
                                        raterStudents: []
                                    };
                                    gradesByClass[classID].push(groupEntry);
                                }

                                // Check if this raterStudent is already in `raterStudents`
                                const alreadyRated = groupEntry.raterStudents.some(student => student.ID === raterID);

                                // Add the raterStudent if they haven't been added yet
                                if (!alreadyRated) {
                                    ratingStudents.push(raterInGroup);  // Add the full `raterInGroup` object or just necessary fields
                                    groupEntry.raterStudents.push(raterInGroup);
                                }
                            }
                        });
                    });
                }
            });
        }
        console.log('Grades for group:', ratingStudents);
        console.log('Grades by class:', gradesByClass);
        res.json(gradesByClass);
    } catch (error) {
        console.error('Error fetching user grades:', error);
        res.status(500).json({ message: 'Error fetching user grades.' });
    }
});

app.get('/studentRateMyInstructor/:instructorID', async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }

        const { instructorID } = req.params; 
        console.log('Instructor ID:', instructorID);

        // Fetch instructor details from the database
        const instructor = await InstructorModel.findOne({ ID: parseInt(instructorID) });
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        // Example: Define rating criteria
        const ratings = [
            { id: 1, title: 'Knowledge' },
            { id: 2, title: 'Clarity' },
            { id: 3, title: 'Engagement' },
            { id: 4, title: 'Helpfulness' },
        ];

        return res.status(200).json({
            instructor: { name: `${instructor.FirstName} ${instructor.LastName}`, id: instructorID },
            ratings,
        });
    } catch (error) {
        console.error('Error fetching instructor details:', error);
        return res.status(500).json({ message: 'An error occurred while fetching instructor details.' });
    }
});


app.post('/instructorRatingsSubmit', async (req, res) => {
    try {
        const { studentID, classID, dimensions, instructorID  } = req.body;

        const rating = {
            classID,
            dimensions: dimensions.map(dimension => ({
                dimensionName: dimension.dimensionName,
                classRatings: dimension.classRatings.map(classRating => ({
                    raterID: classRating.raterID,
                    ratingValue: classRating.ratingValue,
                    comments: classRating.comments
                }))
            }))
        };

        // Update the instructor's Ratings array with the new rating
        const instructor = await InstructorModel.findOneAndUpdate(
            { ID: instructorID  },  // Replace with actual instructor ID field
            { $push: { Ratings: rating } },
            { new: true } // Return the updated document
        );

        if (instructor) {
            res.status(200).send('Rating saved successfully');
        } else {
            res.status(404).send('Instructor not found');
        }
    } catch (error) {
        res.status(500).send('Error saving rating: ' + error.message);
    }
});

app.get('/hasRatedInstructor', async (req, res) => {
    const { studentID, instructorID, classID } = req.query; // Get studentID, instructorID, and classID from query parameters

    if (!studentID || !instructorID || !classID) {
        return res.status(400).json({ message: 'Student ID, Instructor ID, and Class ID are required.' });
    }

    try {
        // Find if there's an existing rating by the student for this instructor and class
        const instructor = await InstructorModel.findOne({
            ID: instructorID,
            'Ratings.classID': parseInt(classID),
            'Ratings.dimensions.classRatings.raterID': parseInt(studentID)
        });

        const ratedInstructorID = instructor?.ID;
        console.log('Rated instructor ID:', ratedInstructorID);
        // If instructor is found with a matching rating, return true
        res.json({ [classID]: ratedInstructorID });
    } catch (error) {
        console.error('Error checking if instructor has been rated:', error);
        res.status(500).json({ message: 'Error checking if instructor has been rated.' });
    }
});

// Endpoint to serve shop items
app.get('/shopItems', (req, res) => {
    res.json(shopItems);
});

// Route to place an order
app.post('/placeOrder', async (req, res) => {
    try {
        // Ensure the user is authenticated and is a student
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }

        // Extract order details from the request body
        const { totalCost } = req.body; 
        const studentID = req.user.ID; 

        // Find and update the student in one atomic operation
        const student = await StudentModel.findOneAndUpdate( 
            { ID: studentID, RiceGrains: { $gte: totalCost } },  // Ensures student has enough grains
            { $inc: { RiceGrains: -totalCost } },  // Deduct grains
            { new: true }  // Return the updated document
        );

        if (!student) {
            return res.status(400).json({ message: 'Not enough grains to complete the purchase or student not found' });
        }

        res.status(200).json({ message: 'Order placed successfully', remainingGrains: student.RiceGrains }); 
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to fetch all classes for instructors and include deadlines
app.get('/instructorManageClasses', async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }

        const instructorID = req.user.ID;
        const classes = await ClassModel.aggregate([
            { $match: { Instructor: instructorID } },
            { $lookup: { from: 'students', localField: 'Students', foreignField: 'ID', as: 'StudentDetails' } },
        ]);

        if (!classes || classes.length === 0) {
            return res.status(200).json({ classes: [], message: 'No classes found for this instructor.' });
        }

        const formattedClasses = classes.map(classItem => ({
            id: classItem.ID,
            name: classItem.Name,
            subject: classItem.Subject,
            section: classItem.Section,
            studentCount: classItem.StudentDetails.length,
            groupCount: Math.ceil(classItem.StudentDetails.length / 5),
            submissionDeadline: classItem.submissionDeadline,
        }));

        return res.status(200).json({ classes: formattedClasses });
    } catch (error) {
        console.error('Error fetching classes:', error.stack || error);
        return res.status(500).json({ message: 'An unexpected error occurred while fetching classes.', error: error.message || error });
    }
});


app.get('/detailView/:classID', async (req, res) => {
    try {
        const { classID } = req.params; // Get classID from the URL
        const parsedClassID = parseInt(classID, 10);
        console.log('classID parameter:', parsedClassID);

        // Log incoming request and authentication status
        console.log('Received request to /detailView/:', parsedClassID);
        console.log('Authentication status:', req.isAuthenticated());

        // Ensure user is authenticated
        if (!req.isAuthenticated() || !req.user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }
        
        // Validate parsedClassID is a number and log result
        if (isNaN(parsedClassID)) {
            console.log('Invalid classID format:', classID);
            return res.status(400).json({ message: 'Invalid class ID.' });
        }
        console.log('Parsed classID:', parsedClassID);

        // Log database query to find students
        console.log('Querying database for students with classID:', parsedClassID);
        
        // Fetch students with populated group details (including GroupName)
        const students = await StudentModel.find(
            { Classes: parsedClassID }, // Find students with the classID in the Classes field
            {
                FirstName: 1,
                LastName: 1,
                ID: 1,
                Email: 1,
                Username: 1,
                Department: 1,
                Classes: 1,
                Groups: 1,
                Ratings: 1
            })

            
        console.log('Student ' + students);
        const groupIDs = students.flatMap(student => student.Groups);
        const groups = await GroupModel.find({
            Class: { $in: classID},
            groupID: { $in: groupIDs}
        })

        const groupMap = Object.fromEntries(groups.map(group => [group.groupID, group.GroupName]));
        console.log(`Group List ${groupMap}`);
         // Log the result of the query
        if (!students || students.length === 0) {
            console.log('No students found for classID:', parsedClassID);
            return res.status(404).json({ message: 'No students found for this class.' });
        }
        console.log(`Found ${students.length} students for classID ${parsedClassID}`);

        // Send the students data in the response along with their group details
        return res.status(200).json({ studentSummary: students , groupDetails: groupMap});

    } catch (error) {
        // Log any errors encountered during execution
        console.error('Error fetching student summary:', error);
        return res.status(500).json({
            message: 'An unexpected error occurred while fetching student summary.',
            error: error.message
        });
    }
});

// Route to validate submission deadlines (optional, to enhance the backend)
app.post('/validateDeadline', async (req, res) => {
    const { submissionDeadline } = req.body;

    if (!submissionDeadline) {
        return res.status(400).json({ message: 'Submission deadline is required.' });
    }

    try {
        const deadlineDate = new Date(submissionDeadline);
        if (isNaN(deadlineDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format.' });
        }

        res.status(200).json({ message: 'Valid deadline.' });
    } catch (error) {
        console.error('Error validating deadline:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Route to get the deadline for a specific class
app.get('/classDeadline/:classID', async (req, res) => {
    const { classID } = req.params;

    try {
        const classData = await ClassModel.findOne({ ID: parseInt(req.params.classID, 10) });
        if (!classData || !classData.submissionDeadline) {
            return res.status(404).json({ message: 'Submission deadline not set for this class.' });
        }
        res.status(200).json({ submissionDeadline: classData.submissionDeadline });
    } catch (error) {
        console.error('Error fetching class deadline:', error);
        res.status(500).json({ message: 'Internal server error while fetching deadline.' });
    }
});

// Route to update the deadline for a class
app.post('/updateDeadline', async (req, res) => {
    const { classID, submissionDeadline } = req.body;

    if (!classID || !submissionDeadline) {
        return res.status(400).json({ message: 'Class ID and valid deadline are required.' });
    }

    try {
        // Ensure `classID` is parsed as an integer
        const classIDAsInt = parseInt(classID, 10);
        if (isNaN(classIDAsInt)) {
            return res.status(400).json({ message: 'Class ID must be a valid integer.' });
        }

        // Validate the deadline
        const deadlineDate = new Date(submissionDeadline);
        if (isNaN(deadlineDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format.' });
        }

        // Update the class in the database by its integer `classID`
        const updatedClass = await ClassModel.findOneAndUpdate(
            { ID: classIDAsInt }, // Adjust this to match your schema field for `classID`
            { submissionDeadline: deadlineDate },
            { new: true } // Return the updated document
        );

        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        res.status(200).json({ message: 'Deadline updated successfully.', class: updatedClass });
    } catch (error) {
        console.error('Error updating deadline:', error);
        res.status(500).json({ message: 'Internal server error while updating deadline.' });
    }
});

app.get('/studentDeadlines', async (req, res) => {
    const { studentID } = req.query;

    if (!studentID) {
        return res.status(400).json({ message: 'Student ID is required.' });
    }

    try {
        // Perform aggregation with $lookup to fetch group and class details
        const groups = await StudentModel.aggregate([
            {
                $match: { ID: parseInt(studentID, 10) } // Match the student by ID
            },
            {
                $lookup: {
                    from: 'groups', // The target collection (groups)
                    localField: 'Groups', // Field in the current collection (student) that contains group IDs
                    foreignField: 'groupID', // Field in the target collection (groups) that matches the group IDs
                    as: 'GroupDetails' // Name of the resulting field
                }
            },
            {
                $unwind: { path: '$GroupDetails', preserveNullAndEmptyArrays: true } // Flatten the array of groups
            },
            {
                $lookup: {
                    from: 'classes', // The target collection (classes)
                    localField: 'GroupDetails.Class', // Field in the groups collection that contains the class ID
                    foreignField: 'ID', // Field in the classes collection that matches the class ID
                    as: 'ClassDetails' // Name of the resulting field
                }
            },
            {
                $unwind: { path: '$ClassDetails', preserveNullAndEmptyArrays: true } // Flatten the array of class details
            },
            {
                $project: { // Select the fields you want to return
                    ID: 1, // Student ID
                    FirstName: 1,
                    LastName: 1,
                    GroupDetails: {
                        groupID: '$GroupDetails.groupID', // Group ID
                        groupName: '$GroupDetails.GroupName', // Group Name
                        classID: '$GroupDetails.Class',
                    },
                    ClassDetails: {
                        name: '$ClassDetails.Name', // Class Name
                        subject: '$ClassDetails.Subject', // Class Subject
                        section: '$ClassDetails.Section', // Class Section
                        submissionDeadline: '$ClassDetails.submissionDeadline' // Submission Deadline
                    }
                }
            }
        ]);

        if (!groups || groups.length === 0) {
            return res.status(404).json({ message: 'No groups or deadlines found for this student.' });
        }

        // Map the response to include groupName and class details at the top level for clarity
        const formattedGroups = groups.map(group => ({
            groupID: group.GroupDetails.groupID,
            groupName: group.GroupDetails.groupName,
            classID: group.GroupDetails.classID,
            className: group.ClassDetails.name,
            classSubject: group.ClassDetails.subject,
            classSection: group.ClassDetails.section,
            submissionDeadline: group.ClassDetails.submissionDeadline
        }));

        res.status(200).json({ groups: formattedGroups });
    } catch (error) {
        console.error('Error fetching student deadlines:', error);
        res.status(500).json({ message: 'Internal server error while fetching deadlines.' });
    }
});


/*
 * 
 * ===== GENERAL ROUTES =====
 * 
 */ 


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

if (process.env.NODE_ENV !== 'test') {
    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
}


// Export the app for testing and router for route modules
module.exports = { app, router };
