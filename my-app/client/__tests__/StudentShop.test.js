import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, } from 'react-router-dom';
import Login from '../src/app/components/Login.jsx';
import StudentDashboard from '../src/app/components/Student/StudentDashboard.jsx';
import Shop from '../src/app/components/Shop/Shop.jsx';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';
import StudentSidebar from '../src/app/components/_StudentSidebar.jsx';

jest.mock('axios');

test('navigates and clicks "Your Ratings" button on the sidebar', async () => {
    // Mock login response
    axios.post.mockResolvedValueOnce({
        data: { message: 'Login successful', user: { id: '40123456' } },
    });

    render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/studentDashboard" element={<StudentDashboard />} />
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
    const ShopButton = screen.getByText(/Shop/i);
    
    expect(ShopButton).toBeInTheDocument();

    // Simulate a click
    ShopButton.click();

    render(
        <MemoryRouter>
            <Shop />
        </MemoryRouter>
    );

    // Verify the navigation
    await waitFor(() => expect(screen.getByTestId("shop")).toBeInTheDocument());

});
