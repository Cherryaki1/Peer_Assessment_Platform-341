// client/src/app/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const InstructorSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:3000/logout', {
                method: 'GET', // Or 'POST' depending on your implementation
                credentials: 'include', // Important to include cookies
            });

            if (response.ok) {
                // Logout successful
                console.log('Logout successful');
                navigate('/');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };
    
    return (
        <div className="sidebar" data-testid="instructorSidebar">
            <ul>
                <li onClick={() => navigate('/instructorDashboard')}>Dashboard</li>
                <li onClick={() => navigate('/instructorManageClasses')}>Manage Classes</li>
                <li onClick={() => navigate('/instructorReviewRatings')}>Your Ratings</li>
                <li onClick={handleLogout}>Logout</li>
            </ul>
        </div>
    );
};

export default InstructorSidebar;
