// client/src/app/Sidebar.js
import React, { useState, useEffect, useContext, createContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLast, ChevronFirst } from "lucide-react";
import axios from 'axios';

import DashboardIcon from './icons/home.svg';
import manageClassesIcon from './icons/book-open.svg';
import reviewRatingsIcon from './icons/chart-bar.svg';
import logoutIcon from './icons/logout.svg';


const SidebarContext = createContext();

const InstructorSidebar = () => {
    const navigate = useNavigate();

    const location = useLocation();
    const [expanded, setExpanded] = useState(() => {
        const savedState = localStorage.getItem('sidebarExpanded');
        return savedState !== null ? JSON.parse(savedState) : true;
    });
    const [instructorName, setInstructorName] = useState('');
    const [instructorID, setInstructorID] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/index', { withCredentials: true });
                if (response.data.user && response.data.user.ID) {
                    setInstructorName(`${response.data.user.FirstName} ${response.data.user.LastName}`);
                    setInstructorID(response.data.user.ID);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        
        fetchUserData();
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebarExpanded', JSON.stringify(expanded));
    }, [expanded]);

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
        <aside className="h-screen sticky top-0 bg-gradient-to-r from-blue-900 to-blue-500 border-r shadow-sm text-white transition-all duration-300 flex flex-col">
            <div className="p-4 pb-2 flex justify-between items-center" data-testid="sidebar">
                {expanded && <h1 className="text-xl font-bold flex-1 text-center">Rice++</h1>}
                <button
                    onClick={() => setExpanded((curr) => !curr)}
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 transition-all duration-300"
                >
                    {expanded ? <ChevronFirst /> : <ChevronLast />}
                </button>
            </div>

            <SidebarContext.Provider value={{ expanded }}>
                <ul className="flex-1 px-3">
                    <SidebarItem
                        icon={<img src={DashboardIcon} alt="Dashboard" />}
                        text="Dashboard"
                        onClick={() => navigate('/instructorDashboard')}
                        active={location.pathname === '/instructorDashboard'}
                    />
                    <SidebarItem
                        icon={<img src={manageClassesIcon} alt="Manage Classes" />}
                        text="Manage Classes"
                        onClick={() => navigate('/instructorManageClasses')}
                        active={location.pathname === '/instructorManageClasses'}
                    />
                    <SidebarItem
                        icon={<img src={reviewRatingsIcon} alt="Your Ratings" />}
                        text="Your Ratings"
                        onClick={() => navigate('/instructorReviewRatings')}
                        active={location.pathname === '/instructorReviewRatings'}
                    />
                </ul>
            </SidebarContext.Provider>

            <div className="border-t flex p-3 mt-auto">
                <img
                    src="/rice.ico"
                    alt="Rice++"
                    className="w-10 h-10 rounded-md"
                />
                <div
                    className={`
                        flex 
                        justify-between 
                        items-center 
                        overflow-hidden 
                        transition-all 
                        duration-300 ${expanded ? "w-52 ml-3" : "w-0"}`}
                >
                    <div className="
                        leading-4 
                        whitespace-nowrap">
                        <h4 className="font-semibold">{instructorName}</h4>
                        <span className="text-xs text-gray-200">{instructorID}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="
                            flex 
                            items-center 
                            p-1.5 
                            rounded-lg 
                            bg-blue-600 
                            hover:bg-gradient-to-r 
                            hover:from-blue-500 
                            hover:to-blue-600 
                            transition-all 
                            duration-300">
                        <img src={logoutIcon} alt="Logout" className="mr-2" />
                        <span className="whitespace-nowrap">Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

const SidebarItem = ({ icon, text, onClick, active }) => {
    const { expanded } = useContext(SidebarContext);

    return (
        <li
            className={`
                relative 
                flex 
                items-center 
                py-2 
                px-3 
                my-1 
                font-medium 
                rounded-md 
                cursor-pointer 
                transition-colors 
                group ${active ? "bg-gradient-to-r from-blue-500 to-blue-600" : ""} 
                hover:bg-gradient-to-r 
                hover:from-blue-500 
                hover:to-blue-600 
                text-white`}
            onClick={onClick}
            style={{ width: '100%', whiteSpace: 'nowrap' }}
        >
            {icon}
            <span
                className={`
                    overflow-hidden 
                    transition-all 
                    duration-300 ${expanded ? "w-52 ml-3" : "w-0"}`}
            >
                {expanded ? text : ''}
            </span>
            {!expanded && (
                <div
                    className={`
                        absolute 
                        left-full 
                        rounded-md 
                        px-2 
                        py-1 
                        ml-6 
                        bg-indigo-100 
                        text-indigo-800 
                        text-sm invisible 
                        opacity-20 
                        -translate-x-3 
                        transition-all 
                        duration-300 
                        group-hover:visible 
                        group-hover:opacity-100 
                        group-hover:translate-x-0`}
                >
                    {text}
                </div>
            )}
        </li>
    );
};

export default InstructorSidebar;