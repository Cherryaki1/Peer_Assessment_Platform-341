const request = require('supertest');
const express = require('express');
const app = express();
const StudentModel = require('../models/studentModel'); // Adjust path based on your project

// Middleware to simulate req.user
let mockUser = null;
app.use((req, res, next) => {
    req.user = mockUser;
    next();
});

// The route to test
app.get('/studentFromUser', async (req, res) => {
    console.log("User data in session:", req.user);

    const userID = Number(req.user.ID);  // Ensure userID is a Number
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

jest.mock('../models/studentModel');

describe('GET /studentFromUser', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if user ID is invalid or missing', async () => {
        mockUser = { ID: 'abc' }; // Invalid user ID
        const response = await request(app).get('/studentFromUser');
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User ID is invalid or missing.');
    });

    it('should return 404 if student is not found', async () => {
        mockUser = { ID: 123 };
        StudentModel.findOne.mockResolvedValueOnce(null); // Simulate no student found

        const response = await request(app).get('/studentFromUser');
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Student not found.');
    });

    it('should return 200 with student data if found', async () => {
        mockUser = { ID: 123 };
        const mockStudent = { ID: 123, name: 'John Doe' };
        StudentModel.findOne.mockResolvedValueOnce(mockStudent); // Simulate student found

        const response = await request(app).get('/studentFromUser');
        expect(response.status).toBe(200);
        expect(response.body.student).toEqual(mockStudent);
    });

    it('should return 500 if an unexpected error occurs', async () => {
        mockUser = { ID: 123 };
        StudentModel.findOne.mockImplementationOnce(() => {
            throw new Error('Unexpected error'); // Simulate error
        });

        const response = await request(app).get('/studentFromUser');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching student data.');
    });
});
