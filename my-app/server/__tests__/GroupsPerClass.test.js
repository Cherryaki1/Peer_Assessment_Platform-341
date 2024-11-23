const express = require('express');
const request = require('supertest');
const GroupModel = require('../models/groupModel');

// Mock GroupModel
jest.mock('../models/groupModel', () => ({
    find: jest.fn(),
}));

describe('GET /groups/:classID', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());

        app.get('/groups/:classID', async (req, res) => {
            try {
                const groups = await GroupModel.find({ classID: req.params.classID });
                res.status(200).json({ groups });
            } catch (error) {
                console.error('Error fetching groups:', error);
                res.status(500).json({ message: 'Error fetching groups' });
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('successfully fetches groups for a class', async () => {
        // Mock groups for the classID
        const mockGroups = [
            { groupID: 1, groupName: 'Group A', classID: '123' },
            { groupID: 2, groupName: 'Group B', classID: '123' },
        ];
        GroupModel.find.mockResolvedValue(mockGroups);

        const response = await request(app).get('/groups/123');

        expect(response.statusCode).toBe(200);
        expect(response.body.groups).toEqual(mockGroups);
        expect(GroupModel.find).toHaveBeenCalledWith({ classID: '123' });
    });

    test('returns an empty array if no groups are found', async () => {
        GroupModel.find.mockResolvedValue([]); // No groups found for classID

        const response = await request(app).get('/groups/123');

        expect(response.statusCode).toBe(200);
        expect(response.body.groups).toEqual([]);
        expect(GroupModel.find).toHaveBeenCalledWith({ classID: '123' });
    });

    test('returns 500 if a database error occurs', async () => {
        GroupModel.find.mockRejectedValue(new Error('Database error')); // Simulate a database error

        const response = await request(app).get('/groups/123');

        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe('Error fetching groups');
        expect(GroupModel.find).toHaveBeenCalledWith({ classID: '123' });
    });
});
c