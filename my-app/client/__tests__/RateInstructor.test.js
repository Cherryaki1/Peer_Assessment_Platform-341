import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, } from 'react-router-dom';
import Login from '../src/app/components/Login.jsx';
import StudentRateMyInstructor from '../src/app/components/Student/StudentRateMyInstructor.jsx';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';
import StudentSidebar from '../src/app/components/_StudentSidebar.jsx';

jest.mock('axios');

test('navigates and clicks "rate my instructor" button on the sidebar', async () => {
    // Mock login response
    axios.post.mockResolvedValueOnce({
        data: { message: 'Login successful', user: { id: '40123456' } },
    });

    render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/studentRateMyInstructor" element={<StudentRateMyInstructor />} />
            </Routes>
        </MemoryRouter>
    );

    // Simulate login
    fireEvent.change(screen.getByLabelText('ID'), { target: { value: '40123456' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    render(
        <MemoryRouter>
            <StudentSidebar />
        </MemoryRouter>
    );

    // Scope to the sidebar
    const sidebar = screen.getByTestId('sidebar');
    sidebar.click();
    const rateMyInstructorButton = screen.getByText(/Rate My Instructor/i);
  
    expect(rateMyInstructorButton).toBeInTheDocument();

    // Simulate a click
    rateMyInstructorButton.click();

    // Verify the navigation
    await waitFor(() => expect(screen.getByText(/Rate My Instructor/i)).toBeInTheDocument());

});
