const request = require('supertest');
const { app } = require('../server'); // Import the Express app
const mongoose = require('mongoose'); // Import mongoose to close the connection
const UserModel = require('../models/userModel');

// Mock UserModel for testing
jest.mock('../models/userModel', () => ({
    findOne: jest.fn(),
}));

describe('POST /login', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await mongoose.connection.close(); // Close the connection to MongoDB
        await mongoose.disconnect(); // Disconnect from the database
    });    

    test('logs in successfully with valid credentials', async () => {
        UserModel.findOne.mockResolvedValue({
            ID: '12345678',
            Password: 'password123',
        });

        const response = await request(app)
            .post('/login')
            .send({ ID: '12345678', Password: 'password123' });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.user.ID).toBe('12345678');
    });

    test('returns 401 for invalid credentials', async () => {
        UserModel.findOne.mockResolvedValue(null);

        const response = await request(app)
            .post('/login')
            .send({ ID: 'wrongID', Password: 'wrongPassword' });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Invalid ID or password');
    });
});
