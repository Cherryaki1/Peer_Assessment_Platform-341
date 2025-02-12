import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import Login from '../src/app/components/Login.jsx';

jest.mock('axios'); // Mock axios to simulate network requests

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

test('renders login page as the first page upon entering the website URL', () => {
    render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );

    // Check if the Rice++ text is visible
    expect(screen.getByText(/Rice\+\+/i)).toBeInTheDocument();

    // Check if the Peer Assessment text is visible
    expect(screen.getByText(/Peer Assessment/i)).toBeInTheDocument();

    // Verify that the login button is visible
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

    // Check if the input boxes for ID and password are present
    expect(screen.getByLabelText(/id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    // Verify that no error message is displayed initially
    expect(screen.queryByText(/login failed/i)).not.toBeInTheDocument();
});


test('displays input boxes for ID and password', () => {
    render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );

    // Check for the input field for ID
    expect(screen.getByLabelText(/id/i)).toBeInTheDocument();
    // Check for the input field for password
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});


test('navigates to instructor dashboard on successful login with ID starting with "1"', async () => {
    // Mock axios response
    axios.post.mockResolvedValueOnce({
        data: { message: 'Login successful', user: { id: '12345678' } },
    });

    render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );

    // Simulate form input
    fireEvent.change(screen.getByLabelText('ID'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'rodrigo123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for navigation
    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/instructorDashboard');
    });
});

test('navigates to student dashboard on successful login with ID not starting with "1"', async () => {
    // Mock axios response for a non-instructor user
    axios.post.mockResolvedValueOnce({
        data: { message: 'Login successful', user: { id: '40123456' } },
    });

    render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );

    // Simulate form input
    fireEvent.change(screen.getByLabelText('ID'), { target: { value: '40123456' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for navigation
    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/studentDashboard');
    });
});

test('displays error message on failed login attempt', async () => {
    axios.post.mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } },
    });

    render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('ID'), { target: { value: 'wrongID' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongPassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
});



