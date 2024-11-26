const express = require('express');
const request = require('supertest');
const StudentModel = require('../models/studentModel');
const GroupModel = require('../models/groupModel');

// Mock Models
jest.mock('../models/studentModel', () => ({
    find: jest.fn(),
}));
jest.mock('../models/groupModel', () => ({
    find: jest.fn(),
}));

describe('GET /studentsSummary/:classID', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const defineRoute = (isAuthenticated, user) => {
        // Middleware for dynamic authentication
        app.use((req, res, next) => {
            req.isAuthenticated = jest.fn(() => isAuthenticated);
            req.user = user;
            next();
        });

        // Define the route
        app.get('/studentsSummary/:classID', async (req, res) => {
            try {
                const { classID } = req.params;
                const parsedClassID = parseInt(classID, 10);

                if (!req.isAuthenticated() || !req.user) {
                    return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
                }

                if (isNaN(parsedClassID)) {
                    return res.status(400).json({ message: 'Invalid class ID.' });
                }

                const students = await StudentModel.find({ Classes: parsedClassID }, {
                    FirstName: 1,
                    LastName: 1,
                    ID: 1,
                    Email: 1,
                    Username: 1,
                    Department: 1,
                    Classes: 1,
                    Groups: 1,
                    Ratings: 1,
                });

                if (!students || students.length === 0) {
                    return res.status(404).json({ message: 'No students found for this class.' });
                }

                const groupIDs = students.flatMap(student => student.Groups);
                const groups = await GroupModel.find({
                    Class: parsedClassID,
                    groupID: { $in: groupIDs },
                });

                const groupMap = Object.fromEntries(groups.map(group => [group.groupID, group.GroupName]));

                return res.status(200).json({
                    studentSummary: students,
                    groupDetails: groupMap,
                });
            } catch (error) {
                return res.status(500).json({
                    message: 'An unexpected error occurred while fetching student summary.',
                    error: error.message,
                });
            }
        });
    };

    test('successfully fetches students and group details', async () => {
        defineRoute(true, { ID: 1 }); // Mock authenticated user

        StudentModel.find.mockResolvedValue([
            { ID: 101, FirstName: 'John', LastName: 'Doe', Groups: [1], Classes: [123] },
            { ID: 102, FirstName: 'Jane', LastName: 'Smith', Groups: [2], Classes: [123] },
        ]);

        GroupModel.find.mockResolvedValue([
            { groupID: 1, GroupName: 'Group A', Class: 123 },
            { groupID: 2, GroupName: 'Group B', Class: 123 },
        ]);

        const response = await request(app).get('/studentsSummary/123');

        expect(response.statusCode).toBe(200);
        expect(response.body.studentSummary).toEqual([
            { ID: 101, FirstName: 'John', LastName: 'Doe', Groups: [1], Classes: [123] },
            { ID: 102, FirstName: 'Jane', LastName: 'Smith', Groups: [2], Classes: [123] },
        ]);
        expect(response.body.groupDetails).toEqual({
            1: 'Group A',
            2: 'Group B',
        });
    });

    test('returns 401 if the user is not authenticated', async () => {
        defineRoute(false, null); // Mock unauthenticated user

        const response = await request(app).get('/studentsSummary/123');
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized: Please log in to access this resource.');
    });

    test('returns 400 for invalid classID', async () => {
        defineRoute(true, { ID: 1 }); // Mock authenticated user

        const response = await request(app).get('/studentsSummary/invalidID');
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid class ID.');
    });

    test('returns 404 if no students are found', async () => {
        defineRoute(true, { ID: 1 }); // Mock authenticated user

        StudentModel.find.mockResolvedValue([]);

        const response = await request(app).get('/studentsSummary/123');
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('No students found for this class.');
    });

    test('returns 500 if an unexpected error occurs', async () => {
        defineRoute(true, { ID: 1 }); // Mock authenticated user

        StudentModel.find.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/studentsSummary/123');
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe('An unexpected error occurred while fetching student summary.');
    });
});
