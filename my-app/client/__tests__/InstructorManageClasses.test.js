import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, } from 'react-router-dom';
import Login from '../src/app/components/Login.jsx';
import InstructorDashboard from '../src/app/components/Instructor/InstructorDashboard.jsx';
import InstructorManageClasses from '../src/app/components/Instructor/InstructorManageClasses.jsx';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';
import StudentSidebar from '../src/app/components/_StudentSidebar.jsx';
import InstructorSidebar from '../src/app/components/_InstructorSidebar.jsx';

jest.mock('axios');

test('navigates and clicks "Manage Classes" button on the sidebar', async () => {
    // Mock login response
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
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'rodrigo123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    render(
        <MemoryRouter>
            <InstructorSidebar />
        </MemoryRouter>
    );

    // Scope to the sidebar
    const sidebar = screen.getByTestId('instructorSidebar');
    sidebar.click();
    const manageClassesButton = screen.getByText(/Manage Classes/i);
  
    expect(manageClassesButton).toBeInTheDocument();

    // Simulate a click
    manageClassesButton.click();

    // Verify the navigation
    await waitFor(() => expect(screen.getByText(/Manage Classes/i)).toBeInTheDocument());

});
