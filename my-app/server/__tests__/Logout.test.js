const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');

describe('GET /logout', () => {
    let app;

    beforeEach(() => {
        app = express();

        // Mock `req.logout` for testing
        app.use((req, res, next) => {
            req.logout = jest.fn((callback) => callback(req.logoutError || null));
            next();
        });

        // Mock `/logout` route
        app.get('/logout', (req, res) => {
            req.logout((err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error logging out' });
                }
                res.json({ message: 'Logout successful' });
            });
        });
    });

    afterAll(async () => {
        await mongoose.connection.close(); // Close MongoDB connection
        await mongoose.disconnect(); // Ensure complete disconnection
    });

    test('logs out successfully', async () => {
        const response = await request(app).get('/logout');

        // Assertions
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Logout successful');
    });
});
