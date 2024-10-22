import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentSidebar = () => {
    const navigate = useNavigate();

    return (
        <div className="sidebar">
            <ul>
                <li onClick={() => navigate('/studentDashboard')}>Dashboard</li>
                <li onClick={() => navigate('/studentManageClasses')}>My Classes</li>
            </ul>
        </div>
    );
};

export default StudentSidebar;