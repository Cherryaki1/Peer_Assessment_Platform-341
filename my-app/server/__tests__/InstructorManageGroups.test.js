const express = require('express');
const request = require('supertest');
const GroupModel = require('../models/groupModel');
const StudentModel = require('../models/studentModel');
const ClassModel = require('../models/classModel');

// Mock Models
jest.mock('../models/groupModel', () => ({
    aggregate: jest.fn(),
}));
jest.mock('../models/studentModel', () => ({
    find: jest.fn(),
}));
jest.mock('../models/classModel', () => ({
    findOne: jest.fn(),
}));

describe('GET /instructorManageGroups/:classID', () => {
    let app;

    const setAuthMiddleware = (isAuthenticated, user) => {
        app.use((req, res, next) => {
            req.isAuthenticated = jest.fn(() => isAuthenticated);
            req.user = user || null;
            next();
        });
    };

    beforeEach(() => {
        app = express();
        app.use(express.json());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('successfully fetches groups and ungrouped students', async () => {
        // Set authentication
        setAuthMiddleware(true, { ID: 1 });

        // Mock database calls
        GroupModel.aggregate.mockResolvedValue([
            {
                groupID: 1,
                GroupName: 'Group A',
                Students: [101, 102],
                StudentDetails: [
                    { ID: 101, FirstName: 'John', LastName: 'Doe' },
                    { ID: 102, FirstName: 'Jane', LastName: 'Smith' },
                ],
            },
        ]);
        ClassModel.findOne.mockResolvedValue({
            ID: 123,
            Students: [101, 102, 103],
        });
        StudentModel.find.mockResolvedValue([{ ID: 103, FirstName: 'Bob', LastName: 'Brown' }]);

        // Define route after middleware
        app.get('/instructorManageGroups/:classID', async (req, res) => {
            try {
                if (!req.isAuthenticated() || !req.user) {
                    return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
                }

                const instructorID = req.user.ID;
                const { classID } = req.params;

                const groups = await GroupModel.aggregate([
                    { $match: { Class: parseInt(classID) } },
                    {
                        $lookup: {
                            from: 'students',
                            localField: 'Students',
                            foreignField: 'ID',
                            as: 'StudentDetails',
                        },
                    },
                ]);

                const classInfo = await ClassModel.findOne({ ID: parseInt(classID) });
                if (!classInfo) {
                    return res.status(404).json({ message: 'Class not found' });
                }

                const studentIDsInGroups = groups.flatMap(group => group.Students);
                const allStudentIDs = classInfo.Students;

                const ungroupedStudents = await StudentModel.find({
                    ID: { $in: allStudentIDs, $nin: studentIDsInGroups },
                });

                const formattedGroups = groups.map(groupItem => ({
                    id: groupItem.groupID,
                    name: groupItem.GroupName,
                    groupMembers: groupItem.StudentDetails.map(student => ({
                        id: student.ID,
                        name: `${student.FirstName} ${student.LastName}`,
                    })),
                }));

                return res.status(200).json({
                    groups: formattedGroups,
                    ungroupedStudents: ungroupedStudents.map(student => ({
                        id: student.ID,
                        name: `${student.FirstName} ${student.LastName}`,
                    })),
                });
            } catch (error) {
                console.error('Error fetching groups and ungrouped students:', error);
                return res.status(500).json({ message: 'An unexpected error occurred while fetching groups.' });
            }
        });

        const response = await request(app).get('/instructorManageGroups/123');

        expect(response.statusCode).toBe(200);
        expect(response.body.groups).toEqual([
            {
                id: 1,
                name: 'Group A',
                groupMembers: [
                    { id: 101, name: 'John Doe' },
                    { id: 102, name: 'Jane Smith' },
                ],
            },
        ]);
        expect(response.body.ungroupedStudents).toEqual([{ id: 103, name: 'Bob Brown' }]);
    });

    test('returns 401 if the user is not authenticated', async () => {
        // Set unauthenticated middleware
        setAuthMiddleware(false);

        // Define route after middleware
        app.get('/instructorManageGroups/:classID', async (req, res) => {
            if (!req.isAuthenticated() || !req.user) {
                return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
            }
            return res.status(200).json({ message: 'Authenticated' });
        });

        const response = await request(app).get('/instructorManageGroups/123');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized: Please log in to access this resource.');
    });

    test('returns 404 if the class is not found', async () => {
        // Set authenticated middleware
        setAuthMiddleware(true, { ID: 1 });

        // Mock database call
        ClassModel.findOne.mockResolvedValue(null);

        // Define route after middleware
        app.get('/instructorManageGroups/:classID', async (req, res) => {
            const classInfo = await ClassModel.findOne({ ID: parseInt(req.params.classID) });
            if (!classInfo) {
                return res.status(404).json({ message: 'Class not found' });
            }
            return res.status(200).json({ message: 'Class found' });
        });

        const response = await request(app).get('/instructorManageGroups/123');

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Class not found');
    });

    test('returns 500 if an unexpected error occurs', async () => {
        // Set authenticated middleware
        setAuthMiddleware(true, { ID: 1 });

        // Mock database call
        GroupModel.aggregate.mockRejectedValue(new Error('Database error'));

        // Define route after middleware
        app.get('/instructorManageGroups/:classID', async (req, res) => {
            try {
                await GroupModel.aggregate([]);
            } catch (error) {
                return res.status(500).json({ message: 'An unexpected error occurred while fetching groups.' });
            }
        });

        const response = await request(app).get('/instructorManageGroups/123');

        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe('An unexpected error occurred while fetching groups.');
    });
});
