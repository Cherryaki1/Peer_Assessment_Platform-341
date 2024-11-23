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

    beforeAll(() => {
        app = express();
        app.use(express.json());

        app.get('/instructorManageGroups/:classID', async (req, res) => {
            try {
                if (!req.isAuthenticated || !req.user) {
                    return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
                }

                const instructorID = req.user.ID;
                const { classID } = req.params;

                if (!Number.isInteger(instructorID)) {
                    return res.status(400).json({ message: 'Invalid instructor ID' });
                }

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

                const studentIDsInGroups = groups.flatMap(group => group.Students);

                const classInfo = await ClassModel.findOne({ ID: parseInt(classID) });
                if (!classInfo) {
                    return res.status(404).json({ message: 'Class not found' });
                }

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
                console.error('Error fetching groups and ungrouped students:', error.stack || error);
                return res.status(500).json({ message: 'An unexpected error occurred while fetching groups.', error: error.message || error });
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('successfully fetches groups and ungrouped students', async () => {
        const mockGroups = [
            { groupID: 1, GroupName: 'Group A', Students: [1, 2], StudentDetails: [{ ID: 1, FirstName: 'John', LastName: 'Doe' }, { ID: 2, FirstName: 'Jane', LastName: 'Smith' }] },
        ];
        const mockClass = { ID: 123, Students: [1, 2, 3] };
        const mockUngroupedStudents = [{ ID: 3, FirstName: 'Tom', LastName: 'Brown' }];

        GroupModel.aggregate.mockResolvedValue(mockGroups);
        ClassModel.findOne.mockResolvedValue(mockClass);
        StudentModel.find.mockResolvedValue(mockUngroupedStudents);

        const response = await request(app)
            .get('/instructorManageGroups/123')
            .set('Authorization', 'Bearer mock-token') // Mock authentication
            .set('Authenticated', 'true');

        expect(response.statusCode).toBe(200);
        expect(response.body.groups).toEqual([
            {
                id: 1,
                name: 'Group A',
                groupMembers: [
                    { id: 1, name: 'John Doe' },
                    { id: 2, name: 'Jane Smith' },
                ],
            },
        ]);
        expect(response.body.ungroupedStudents).toEqual([
            { id: 3, name: 'Tom Brown' },
        ]);
    });

    test('returns 401 if the user is not authenticated', async () => {
        const response = await request(app).get('/instructorManageGroups/123');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized: Please log in to access this resource.');
    });

    test('returns 404 if the class is not found', async () => {
        ClassModel.findOne.mockResolvedValue(null);

        const response = await request(app)
            .get('/instructorManageGroups/123')
            .set('Authorization', 'Bearer mock-token') // Mock authentication
            .set('Authenticated', 'true');

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Class not found');
    });

    test('returns 500 if an unexpected error occurs', async () => {
        GroupModel.aggregate.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .get('/instructorManageGroups/123')
            .set('Authorization', 'Bearer mock-token') // Mock authentication
            .set('Authenticated', 'true');

        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe('An unexpected error occurred while fetching groups.');
    });
});
