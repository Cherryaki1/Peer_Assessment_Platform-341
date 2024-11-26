const request = require('supertest');
const app = require('../server'); // Adjust the path to your app
const StudentModel = require('../models/studentModel'); // Adjust the path to your model

jest.mock('../models/studentModel'); // Mock the model

describe('POST /studentRatingsSubmit', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should successfully save a rating and update rice grains', async () => {
        // Mock input data
        const requestData = {
            studentID: 1,
            classID: 101,
            dimensions: [
                {
                    dimensionName: 'Teamwork',
                    groupRatings: [
                        { raterID: 2, ratingValue: 5, comments: 'Great teamwork' },
                        { raterID: 3, ratingValue: 5, comments: 'Excellent' }
                    ]
                },
                {
                    dimensionName: 'Communication',
                    groupRatings: [
                        { raterID: 4, ratingValue: 4, comments: 'Good effort' }
                    ]
                }
            ]
        };

        // Mock the student document
        const updatedStudent = {
            ID: 1,
            Ratings: [/* previous ratings */],
            RiceGrains: 120 // Updated rice grains
        };

        // Mock the database operation
        StudentModel.findOneAndUpdate.mockResolvedValue(updatedStudent);

        const response = await request(app)
            .post('/studentRatingsSubmit')
            .send(requestData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Rating saved successfully');
        expect(response.body.riceGrainsAwarded).toBe(130); // 80 grains from ratings + 50 bonus for perfect rating
        expect(response.body.totalRiceGrains).toBe(120); // Mocked total after update
    });

    it('should return 404 if the student is not found', async () => {
        // Mock findOneAndUpdate to return null (student not found)
        StudentModel.findOneAndUpdate.mockResolvedValue(null);

        const requestData = {
            studentID: 999,
            classID: 101,
            dimensions: []
        };

        const response = await request(app)
            .post('/studentRatingsSubmit')
            .send(requestData);

        expect(response.status).toBe(404);
        expect(response.text).toBe('Student not found');
    });

    it('should return 400 if required fields are missing', async () => {
        const requestData = {
            studentID: null, // Missing student ID
            classID: 101,
            dimensions: []
        };

        const response = await request(app)
            .post('/studentRatingsSubmit')
            .send(requestData);

        expect(response.status).toBe(400); // Assuming you validate input before processing
        expect(response.text).toContain('Bad Request'); // Adjust based on your validation message
    });

    it('should return 500 on server error', async () => {
        // Mock findOneAndUpdate to throw an error
        StudentModel.findOneAndUpdate.mockRejectedValue(new Error('Database error'));

        const requestData = {
            studentID: 1,
            classID: 101,
            dimensions: []
        };

        const response = await request(app)
            .post('/studentRatingsSubmit')
            .send(requestData);

        expect(response.status).toBe(500);
        expect(response.text).toContain('Error saving rating: Database error');
    });
});