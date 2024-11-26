const express = require('express');
const request = require('supertest');
const StudentModel = require('../models/studentModel');
const ClassModel = require('../models/classModel');
const InstructorModel = require('../models/instructorModel');
const GroupModel = require('../models/groupModel');

// Mock Models
jest.mock('../models/studentModel', () => ({
    updateMany: jest.fn(),
}));
jest.mock('../models/classModel', () => ({
    updateOne: jest.fn(),
}));
jest.mock('../models/instructorModel', () => ({
    updateOne: jest.fn(),
}));
jest.mock('../models/groupModel', () => jest.fn(() => ({ save: jest.fn() })));

describe('POST /createGroup', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());

        // Middleware to mock authentication
        app.use((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true); // Mock isAuthenticated to return true
            req.user = { ID: '456' }; // Mock user object
            next();
        });

        // Mock route
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
                    groupID: newGroupID,
                });

                await newGroup.save();

                await ClassModel.updateOne(
                    { ID: classID },
                    { $addToSet: { Groups: newGroupID } }
                );

                await InstructorModel.updateOne(
                    { ID: instructorID },
                    { $addToSet: { Groups: newGroupID } }
                );

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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('successfully creates a group with valid data', async () => {
        GroupModel.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({}),
        }));
        ClassModel.updateOne.mockResolvedValue({});
        InstructorModel.updateOne.mockResolvedValue({});
        StudentModel.updateMany.mockResolvedValue({});

        const response = await request(app)
            .post('/createGroup')
            .send({
                newGroupName: 'Group A',
                classID: '123',
                instructorID: '456',
                newStudentIDs: ['1', '2', '3'],
                newGroupID: '789',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Group created successfully');
    });

    test('returns 400 if required group details are missing', async () => {
        const response = await request(app).post('/createGroup').send({
            newGroupName: 'Group A',
            classID: '123',
            // Missing instructorID, newStudentIDs, and newGroupID
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Missing group details.');
    });

    test('returns 401 if user is not authenticated', async () => {
        // Create a new app instance for this test
        const appForUnauthorizedTest = express();
        appForUnauthorizedTest.use(express.json());
    
        // Middleware to simulate an unauthenticated user
        appForUnauthorizedTest.use((req, res, next) => {
            req.isAuthenticated = jest.fn(() => false); // Always return false for this test
            req.user = null; // No user object
            next();
        });
    
        // Add the route to the new app instance
        appForUnauthorizedTest.post('/createGroup', async (req, res) => {
            try {
                if (!req.isAuthenticated() || !req.user) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
    
                // The rest of the route logic is irrelevant for this test
                res.status(201).json({ message: 'This should not happen' });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    
        // Make the request
        const response = await request(appForUnauthorizedTest)
            .post('/createGroup')
            .send({
                newGroupName: 'Group A',
                classID: '123',
                instructorID: '456',
                newStudentIDs: ['1', '2', '3'],
                newGroupID: '789',
            });
    
        // Assertions
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });
    
    test('returns 500 if an error occurs while creating the group', async () => {
        GroupModel.mockImplementation(() => ({
            save: jest.fn().mockRejectedValue(new Error('Database error')),
        }));

        const response = await request(app)
            .post('/createGroup')
            .send({
                newGroupName: 'Group A',
                classID: '123',
                instructorID: '456',
                newStudentIDs: ['1', '2', '3'],
                newGroupID: '789',
            });

        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe('Error creating group');
    });
});
