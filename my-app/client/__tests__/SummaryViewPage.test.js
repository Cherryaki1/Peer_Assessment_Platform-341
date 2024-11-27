import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../src/app/components/Login.jsx';
import SummaryViewPage from '../src/app/components/Instructor/SummaryViewPage.jsx';
import InstructorDashboard from '../src/app/components/Instructor/InstructorDashboard.jsx'; 
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';

jest.mock('axios');

test('Opens Summary View after logging in to the dashboard', async () => {
    // Mock login axios call
    axios.post.mockResolvedValueOnce({
        data: { message: 'Login successful', user: { id: '12345678', FirstName: 'John' } },
    });

    // Mock user fetch axios call
    axios.get.mockImplementation((url) => {
        if (url.includes('/index')) {
            return Promise.resolve({
                data: { 
                    user: { FirstName: 'John' }, 
                    message: 'User fetched successfully' 
                }
            });
        }
        
        // Mock classes fetch
        if (url.includes('/instructorManageClasses')) {
            return Promise.resolve({
                data: { 
                    classes: [{ 
                        id: '1', 
                        name: 'Test Class', 
                        subject: 'Math', 
                        section: 'A', 
                        studentCount: 20, 
                        groupCount: 4 
                    }] 
                }
            });
        }

        return Promise.reject(new Error('Not found'));
    });

    // Render the login page
    render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/instructorDashboard" element={<InstructorDashboard />} />
                <Route path="/studentsSummaryPage/:classID" element={<div>Summary View for Class</div>} />
            </Routes>
        </MemoryRouter>
    );

    // Simulate login
    fireEvent.change(screen.getByLabelText('ID'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for dashboard to load
    await waitFor(() => {
        expect(screen.getByText('Welcome Instructor, John!')).toBeInTheDocument();
    });

    // Find and click the summary view button
    const summaryViewButtons = screen.getAllByText('Summary View');
    expect(summaryViewButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(summaryViewButtons[0]);

    // Verify navigation to summary view
    await waitFor(() => {
        expect(screen.getByText(/Summary View for Class/i)).toBeInTheDocument();
    });
});