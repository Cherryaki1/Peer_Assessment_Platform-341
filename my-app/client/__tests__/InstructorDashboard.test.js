import React from 'react';
import { render, screen,fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../src/app/components/Login.jsx';
import InstructorDashboard from '../src/app/components/Instructor/InstructorDashboard.jsx'; 
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';


jest.mock('axios');

test('renders instructor dashboard upon successful login', async () => {
    // Mock axios response
    axios.post.mockResolvedValueOnce({
        data: { message: 'Login successful', user: { id: '12345678' } },
    });

    render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/instructorDashboard" element={<InstructorDashboard />} />
            </Routes>
        </MemoryRouter>
    );

    // Simulate login
    fireEvent.change(screen.getByLabelText('ID'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for navigation and check the Instructor Dashboard content
    await waitFor(() => {
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();;    });
});

