const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const ClassModel = require('../models/classModel'); // Mock ClassModel

// Mock ClassModel for testing
jest.mock('../models/classModel', () => ({
    aggregate: jest.fn(),
}));

describe('GET /instructorManageClasses', () => {
    let app;

    beforeEach(() => {
        app = express();

        // Middleware to mock authentication
        app.use((req, res, next) => {
            const isAuthenticatedHeader = req.get('Authenticated');
            req.authenticated = isAuthenticatedHeader === 'true'; // Set `authenticated` from header
            req.isAuthenticated = jest.fn(() => req.authenticated); // Mock `isAuthenticated`

            const instructorID = parseInt(req.get('InstructorID'), 10);
            req.user = req.authenticated ? { ID: instructorID || null } : null; // Mock `user` object with ID

            next();
        });

        // Define the `/instructorManageClasses` route
        app.get('/instructorManageClasses', async (req, res) => {
            try {
                if (!req.isAuthenticated() || !req.user) {
                    return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
                }

                const instructorID = req.user.ID;

                if (!Number.isInteger(instructorID)) {
                    return res.status(400).json({ message: 'Invalid instructor ID' });
                }

                const classes = await ClassModel.aggregate([
                    { $match: { Instructor: instructorID } },
                    {
                        $lookup: {
                            from: 'students',
                            localField: 'Students',
                            foreignField: 'ID',
                            as: 'StudentDetails',
                        },
                    },
                ]);

                if (!classes || classes.length === 0) {
                    return res.status(200).json({ classes: [], message: 'No classes found for this instructor.' });
                }

                const formattedClasses = classes.map((classItem) => ({
                    id: classItem.ID,
                    name: classItem.Name,
                    subject: classItem.Subject,
                    section: classItem.Section,
                    studentCount: classItem.StudentDetails.length,
                    groupCount: Math.ceil(classItem.StudentDetails.length / 5),
                }));

                return res.status(200).json({ classes: formattedClasses });
            } catch (error) {
                return res.status(500).json({
                    message: 'An unexpected error occurred while fetching classes.',
                    error: error.message || error,
                });
            }
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongoose.disconnect();
    });

    test('returns 401 for unauthorized access', async () => {
        const response = await request(app).get('/instructorManageClasses');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized: Please log in to access this resource.');
    });

    test('returns 400 for invalid instructor ID', async () => {
        const response = await request(app)
            .get('/instructorManageClasses')
            .set('Authenticated', 'true') // Simulate authenticated user
            .set('InstructorID', 'invalidID'); // Pass invalid instructor ID

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid instructor ID');
    });

    test('returns no classes for instructor with no classes', async () => {
        ClassModel.aggregate.mockResolvedValueOnce([]);

        const response = await request(app)
            .get('/instructorManageClasses')
            .set('Authenticated', 'true') // Simulate authenticated user
            .set('InstructorID', '1'); // Valid instructor ID

        expect(response.statusCode).toBe(200);
        expect(response.body.classes).toEqual([]);
        expect(response.body.message).toBe('No classes found for this instructor.');
    });

    test('returns formatted class data for instructor', async () => {
        ClassModel.aggregate.mockResolvedValueOnce([
            {
                ID: 1,
                Name: 'Class A',
                Subject: 'Math',
                Section: '101',
                StudentDetails: [{ ID: 1 }, { ID: 2 }, { ID: 3 }],
            },
            {
                ID: 2,
                Name: 'Class B',
                Subject: 'Science',
                Section: '202',
                StudentDetails: [{ ID: 4 }, { ID: 5 }],
            },
        ]);

        const response = await request(app)
            .get('/instructorManageClasses')
            .set('Authenticated', 'true') // Simulate authenticated user
            .set('InstructorID', '1'); // Valid instructor ID

        expect(response.statusCode).toBe(200);
        expect(response.body.classes).toEqual([
            {
                id: 1,
                name: 'Class A',
                subject: 'Math',
                section: '101',
                studentCount: 3,
                groupCount: 1,
            },
            {
                id: 2,
                name: 'Class B',
                subject: 'Science',
                section: '202',
                studentCount: 2,
                groupCount: 1,
            },
        ]);
    });

    test('returns 500 on unexpected error', async () => {
        ClassModel.aggregate.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .get('/instructorManageClasses')
            .set('Authenticated', 'true') // Simulate authenticated user
            .set('InstructorID', '1'); // Valid instructor ID

        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe('An unexpected error occurred while fetching classes.');
        expect(response.body.error).toBe('Database error');
    });
});
