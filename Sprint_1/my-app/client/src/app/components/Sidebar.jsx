// client/src/app/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <div className="sidebar">
            <ul>
                <li onClick={() => navigate('/dashboard')}>Dashboard</li>
                <li onClick={() => navigate('/instructorManageClasses')}>Manage Classes</li>
                
            </ul>
        </div>
    );
};

export default Sidebar;
