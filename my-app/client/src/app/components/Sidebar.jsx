// client/src/app/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <div className="sidebar bg-red-900">
            <ul>
                <li className="text-white" onClick={() => navigate('/instructorDashboard')}>Dashboard</li>
                <li className="text-white" onClick={() => navigate('/instructorManageClasses')}>Manage Classes</li>
                
            </ul>
        </div>
    );
};

export default Sidebar;
