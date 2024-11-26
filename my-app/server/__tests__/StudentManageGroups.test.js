const request = require('supertest');
const express = require('express');
const app = express();

// Mocking the database models
const GroupModel = require('../models/groupModel');
const ClassModel = require('../models/classModel');
const StudentModel = require('../models/studentModel');

jest.mock('../models/groupModel');
jest.mock('../models/classModel');
jest.mock('../models/studentModel');

// Mock the middleware
app.use((req, res, next) => {
    req.isAuthenticated = req.headers.authenticated === 'true';
    req.user = req.isAuthenticated ? { ID: parseInt(req.headers.userid) } : null;
    next();
});

// Sample implementation of the route in a minimal Express app
app.get('/studentManageGroups/:classID', async (req, res) => {
    try {
        if (!req.isAuthenticated) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }

        const studentID = req.user?.ID;
        const { classID } = req.params;

        if (!Number.isInteger(studentID)) {
            return res.status(400).json({ message: 'Invalid student ID' });
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

        if (!groups || groups.length === 0) {
            console.log('No groups found for class:', classID);
            return res.status(404).json({ message: 'Class not found' });
        }

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
        return res.status(500).json({
            message: 'An unexpected error occurred while fetching groups.',
            error: error.message || error,
        });
    }
});


describe('GET /studentManageGroups/:classID', () => {
    it('should return 401 if the user is not authenticated', async () => {
        const response = await request(app).get('/studentManageGroups/1');
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized: Please log in to access this resource.');
    });

    it('should return 400 if the student ID is invalid', async () => {
        const response = await request(app)
            .get('/studentManageGroups/1')
            .set('authenticated', 'true') // Simulate authenticated user
            .set('userid', 'invalid'); // Pass invalid user ID
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid student ID');
    });

    it('should return 404 if the class is not found', async () => {
        jest.spyOn(ClassModel, 'findOne').mockResolvedValue(null); // Mock class not found
        jest.spyOn(GroupModel, 'aggregate').mockResolvedValue([]); // Mock no groups

        const response = await request(app)
            .get('/studentManageGroups/1')
            .set('authenticated', 'true') // Simulate authenticated user
            .set('userid', '1'); // Pass valid user ID
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Class not found');
    });

    it('should return 200 with formatted groups and ungrouped students', async () => {
        jest.spyOn(ClassModel, 'findOne').mockResolvedValue({ ID: 1, Students: [1, 2, 3, 4] });
        jest.spyOn(GroupModel, 'aggregate').mockResolvedValue([
            {
                groupID: 1,
                GroupName: 'Group A',
                Students: [1, 2],
                StudentDetails: [
                    { ID: 1, FirstName: 'John', LastName: 'Doe' },
                    { ID: 2, FirstName: 'Jane', LastName: 'Smith' },
                ],
            },
        ]);
        jest.spyOn(StudentModel, 'find').mockResolvedValue([
            { ID: 3, FirstName: 'Emily', LastName: 'Clark' },
            { ID: 4, FirstName: 'Michael', LastName: 'Brown' },
        ]);

        const response = await request(app)
            .get('/studentManageGroups/1')
            .set('authenticated', 'true') // Simulate authenticated user
            .set('userid', '1'); // Pass valid user ID
        expect(response.status).toBe(200);
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
            { id: 3, name: 'Emily Clark' },
            { id: 4, name: 'Michael Brown' },
        ]);
    });
});