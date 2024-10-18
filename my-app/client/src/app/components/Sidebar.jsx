// client/src/app/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <div className="sidebar">
            <ul>
                <li onClick={() => navigate('/instructorDashboard')}>Dashboard</li>
                <li onClick={() => navigate('/instructorManageClasses')}>Manage Classes</li>
                <li onClick={() => navigate('/instructorManageGroups')}>Manage Groups</li>
                
            </ul>
        </div>
    );
};

export default Sidebar;
