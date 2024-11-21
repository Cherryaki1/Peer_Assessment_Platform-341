const request = require('supertest');
const { app } = require('../server'); // Import the Express app
const mongoose = require('mongoose'); // Import mongoose to close the connection
const UserModel = require('../models/userModel');

// Mock UserModel for testing
jest.mock('../models/userModel', () => ({
    findOne: jest.fn(),
}));

describe('GET /index', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await mongoose.connection.close(); // Close the connection to MongoDB
        await mongoose.disconnect(); // Ensure complete disconnection
    });

    test('returns user data when authenticated', async () => {
        // Mock user data for login
        UserModel.findOne.mockResolvedValue({
            ID: '12345678',
            Password: 'password123',
        });

        // Perform login to authenticate the user
        const loginResponse = await request(app)
            .post('/login')
            .send({ ID: '12345678', Password: 'password123' });

        expect(loginResponse.statusCode).toBe(200);

        // Use the authenticated session to access /index
        const cookie = loginResponse.headers['set-cookie']; // Extract session cookie
        const indexResponse = await request(app).get('/index').set('Cookie', cookie);

        // Assertions for the /index route
        expect(indexResponse.statusCode).toBe(200);
        expect(indexResponse.body.user.ID).toBe('12345678');
        expect(indexResponse.body.message).toBe('');
    });

    test('returns 401 when not authenticated', async () => {
        const response = await request(app).get('/index');

        // Assertions for unauthorized access
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });
});
