const express = require('express');
const request = require('supertest');
const InstructorModel = require('../models/instructorModel');

// Mock the InstructorModel
jest.mock('../models/instructorModel', () => ({
    findOne: jest.fn(),
}));

describe('GET /getInstructorGrades', () => {
    let app;

    beforeAll(() => {
        app = express();

        // Define the route
        app.get('/getInstructorGrades', async (req, res) => {
            const { userID } = req.query;

            if (!userID) {
                return res.status(400).json({ message: 'User ID is required.' });
            }

            try {
                const instructor = await InstructorModel.findOne({ ID: Number(userID) });

                if (!instructor) {
                    return res.status(404).json({ message: 'Instructor not found.' });
                }

                const ratingsByClass = instructor.Ratings.reduce((acc, rating) => {
                    const { classID } = rating;
                    if (!acc[classID]) {
                        acc[classID] = [];
                    }
                    acc[classID].push(rating);
                    return acc;
                }, {});

                res.json(ratingsByClass);
            } catch (error) {
                console.error('Error fetching instructor ratings:', error);
                res.status(500).json({ message: 'Error fetching instructor ratings.' });
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns grouped ratings by classID for a valid userID', async () => {
        // Mock data
        InstructorModel.findOne.mockResolvedValue({
            ID: 1,
            Ratings: [
                { classID: 101, rating: 5 },
                { classID: 101, rating: 4 },
                { classID: 102, rating: 3 },
            ],
        });

        const response = await request(app).get('/getInstructorGrades').query({ userID: 1 });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            101: [
                { classID: 101, rating: 5 },
                { classID: 101, rating: 4 },
            ],
            102: [{ classID: 102, rating: 3 }],
        });
    });

    test('returns 400 if userID is missing', async () => {
        const response = await request(app).get('/getInstructorGrades');

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('User ID is required.');
    });

    test('returns 404 if instructor is not found', async () => {
        InstructorModel.findOne.mockResolvedValue(null);

        const response = await request(app).get('/getInstructorGrades').query({ userID: 999 });

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Instructor not found.');
    });

    test('returns 500 if an error occurs during database query', async () => {
        InstructorModel.findOne.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/getInstructorGrades').query({ userID: 1 });

        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe('Error fetching instructor ratings.');
    });
});
