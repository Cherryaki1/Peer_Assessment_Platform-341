import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";

import CollapseIcon from './icons/bars-3.svg';

import Dashboard from './icons/home.svg';
import myClasses from './icons/book-open.svg';
import yourRatings from './icons/chart-bar.svg';
import rateInstructor from './icons/academic-cap.svg';
import logoutIcon from './icons/logout.svg';
import Shop from './icons/shopping-bag.svg';


const StudentSidebar = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);
    const Menus = [
        { title: "Dashboard", src: "Chart_fill" },
        { title: "Inbox", src: "Chat" },
        { title: "Accounts", src: "User", gap: true },
        { title: "Schedule ", src: "Calendar" },
        { title: "Search", src: "Search" },
        { title: "Analytics", src: "Chart" },
        { title: "Files ", src: "Folder", gap: true },
        { title: "Setting", src: "Setting" },
    ];
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
        <div className="flex">
            <div className={` ${open ? "w-72" : "w-20 "} 
            bg-blue-500
            h-screen 
            p-5  
            pt-8 
            relative 
            duration-300`}>
                <img src={CollapseIcon}
                    className={`absolute
                    cursor-pointer 
                    -right-3 
                    top-9 
                    w-7 
                    border-dark-purple 
                    border-2 rounded-full  
                    ${!open && "rotate-180"}`} onClick={() => setOpen(!open)}
                />
                <div className="flex gap-x-4 items-center">
                    <img src="./rice.ico"
                        style={{ width: "40px", height: "40px" }}/>
                    <h1 className={`
                    text-white 
                    origin-left 
                    font-medium 
                    text-xl 
                    duration-200 ${!open && "scale-0"}`}>
                        Student
                    </h1>
                </div>

                <ul className="pt-6">
                    <li
                        onClick={() => navigate('/studentDashboard')}
                        className="
                        flex 
                        rounded-md 
                        p-2 
                        cursor-pointer 
                        hover:bg-light-white 
                        text-gray-300 
                        text-sm 
                        items-center 
                        gap-x-4 
                        mt-2 
                        bg-light-white"
                    >
                        <img src={Dashboard} />
                        <span className=
                        {`${!open && "hidden"} 
                        origin-left 
                        duration-200`}>
                            Dashboard
                        </span>
                    </li>
                    <li
                        onClick={() => navigate('/studentManageClasses')}
                        className="
                        flex 
                        rounded-md 
                        p-2 
                        cursor-pointer 
                        hover:bg-light-white 
                        text-gray-300 
                        text-sm 
                        items-center
                         gap-x-4 
                         mt-2"
                    >
                        <img src={myClasses} />
                        <span className=
                        {`${!open && "hidden"}
                        origin-left 
                        duration-200`}>
                            My Classes
                        </span>
                    </li>
                    <li
                        onClick={() => navigate('/studentReviewRatings')}
                        className="
                        flex 
                        rounded-md 
                        p-2 
                        cursor-pointer 
                        hover:bg-light-white 
                        text-gray-300 
                        text-sm 
                        items-center 
                        gap-x-4 
                        mt-2"
                    >
                        <img src={yourRatings} />
                        <span className=
                        {`${!open && "hidden"} 
                        origin-left 
                        duration-200`}>
                            Your Ratings
                        </span>
                    </li>
                    <li
                        onClick={() => navigate('/studentRateMyInstructor')}
                        className="
                        flex 
                        rounded-md 
                        p-2 
                        cursor-pointer 
                        hover:bg-light-white 
                        text-gray-300 
                        text-sm 
                        items-center 
                        gap-x-4 mt-2"
                    >
                        <img src={rateInstructor} />
                        <span className=
                        {`${!open && "hidden"} 
                        origin-left 
                        duration-200`}>
                            Rate My Instructor
                        </span>
                    </li>
                    <li
                        onClick={() => navigate('/Shop')} 
                        className="
                        flex 
                        rounded-md 
                        p-2 
                        cursor-pointer 
                        hover:bg-light-white 
                        text-gray-300 
                        text-sm 
                        items-center 
                        gap-x-4 
                        mt-2"
                    >
                        <img src={Shop} className="w-6 h-6 text-white" alt="Logout Icon" />
                        <span className=
                        {`${!open && "hidden"} 
                        origin-left 
                        duration-200`}
                        >
                            Shop
                        </span>
                    </li>
                    <li
                        onClick={handleLogout}
                        className="
                        flex 
                        rounded-md 
                        p-2 
                        cursor-pointer 
                        hover:bg-light-white 
                        text-gray-300 
                        text-sm 
                        items-center 
                        gap-x-4 
                        mt-2"
                    >
                        <img src={logoutIcon} className="w-6 h-6 text-white" alt="Logout Icon" />
                        <span className=
                        {`${!open && "hidden"} 
                        origin-left 
                        duration-200`}
                        >
                            Logout
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default StudentSidebar;
