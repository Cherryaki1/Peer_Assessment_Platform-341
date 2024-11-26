const express = require('express');
const request = require('supertest');
const app = express();
app.use(express.json());

// Mock route
let isAuthenticated = false; // Boolean to simulate authentication status
let mockUser = null; // To simulate the authenticated user object

app.use((req, res, next) => {
    req.isAuthenticated = () => isAuthenticated;
    req.user = mockUser;
    next();
});

const ClassModel = {
    aggregate: jest.fn(),
};

// Include your `/studentManageClasses` route
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
        
        if (!classes || classes.length === 0) {
            return res.status(200).json({ classes: [], message: 'No classes found for this student.' });
        }
    } catch (error) {
        console.error('Error fetching classes:', error);
        return res.status(500).json({ message: 'An unexpected error occurred while fetching classes.', error: error.message });
    }
});

describe('GET /studentManageClasses', () => {
    beforeEach(() => {
        isAuthenticated = false; // Reset authentication status
        mockUser = null; // Reset user object
        jest.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        const response = await request(app).get('/studentManageClasses');
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized: Please log in to access this resource.');
    });

    it('should return 401 if user is authenticated but no user object is present', async () => {
        isAuthenticated = true; // Simulate authenticated user
        mockUser = null; // User object is missing

        const response = await request(app).get('/studentManageClasses');
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized: Please log in to access this resource.');
    });

    it('should return 400 if the student ID is invalid', async () => {
        isAuthenticated = true;
        mockUser = { ID: 'invalid' }; // Invalid student ID

        const response = await request(app).get('/studentManageClasses');
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid student ID');
    });

    it('should return 200 with an empty classes array if no classes are found', async () => {
        isAuthenticated = true;
        mockUser = { ID: 123 }; // Valid user
        ClassModel.aggregate.mockResolvedValue([]);

        const response = await request(app).get('/studentManageClasses');
        expect(response.status).toBe(200);
        expect(response.body.classes).toEqual([]);
        expect(response.body.message).toBe('No classes found for this student.');
    });

    it('should return 500 if an unexpected error occurs', async () => {
        isAuthenticated = true;
        mockUser = { ID: 123 }; // Valid user

        // Simulate an error in the route handler
        ClassModel.aggregate.mockImplementationOnce(() => {
            throw new Error('Unexpected error');
        });

        const response = await request(app).get('/studentManageClasses');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('An unexpected error occurred while fetching classes.');
    });
});