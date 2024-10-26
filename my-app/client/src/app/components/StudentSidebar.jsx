import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentSidebar = () => {
    const navigate = useNavigate();

    // Logout handler
    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'GET', // Or 'POST' depending on your implementation
                credentials: 'include', // Important to include cookies
            });

            if (response.ok) {
                // Logout successful
                console.log('Logout successful');
                // Redirect to login or home page
                navigate('/'); // Adjust the route as necessary
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
                <li onClick={handleLogout}>Logout</li>
            </ul>
        </div>
    );
};

export default StudentSidebar;
