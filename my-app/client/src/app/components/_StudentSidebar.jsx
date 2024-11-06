import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentSidebar = () => {
    const navigate = useNavigate();

    // Logout handler
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
        <div className="sidebar">
            <ul>
                <li onClick={() => navigate('/studentDashboard')}>Dashboard</li>
                <li onClick={() => navigate('/studentManageClasses')}>My Classes</li>
                <li onClick={() => navigate('/studentReviewRatings')}>Review Ratings</li>
                <li onClick={handleLogout}>Logout</li>
            </ul>
        </div>
    );
};

export default StudentSidebar;
